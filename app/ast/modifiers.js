const { astType, nodeType, expressionType } = require('./typeNames');
const {
	rootNode,
	getIdentifiersScopedToNode,
	getChildrenIds,
	getNode, getIdentifier,
	getNodeOrExpType, getNodeType, getExpressionType,
	extractFragment
} = require('./accessors');
const {
	createNumberExpression,
	createCaseBranch,
	createIdentifier,
	createDoExpression
} = require('./constructors');

// Program | ProgramFragment, Identifier, ProgramFragment -> Program | ProgramFragment
function bindIdentifier(program, identifier, valueExpFrag) {
	const newProgram = Object.assign({}, program);
	const newIdentifier = Object.assign({}, identifier, {
		value: rootNode(valueExpFrag).id
	});
	newProgram.identifiers = Object.assign({},
		newProgram.identifiers,
		valueExpFrag.identifiers,
		{ [identifier.id]: newIdentifier }
	);
	newProgram.nodes = Object.assign({},
		newProgram.nodes,
		valueExpFrag.nodes
	);

	// update scoped node's boundIdentifiers property
	if (identifier.scope) {
		newProgram.nodes[identifier.scope] = Object.assign({},
			newProgram.nodes[identifier.scope], {
				boundIdentifiers: [
					...newProgram.nodes[identifier.scope].boundIdentifiers,
					identifier.id
				]
			}
		);
	}

	return newProgram;
}

// Program | ProgramFragment, [[Identifier, ProgramFragment]] -> Program | ProgramFragment
function bindIdentifiers(program, identMap) {
	const newProgram = Object.assign({}, program);
	newProgram.identifiers = Object.assign({}, newProgram.identifiers);
	newProgram.nodes = Object.assign({}, newProgram.nodes);

	for (const [ident, valFrag] of identMap) {
		Object.assign(newProgram.identifiers, valFrag.identifiers);
		Object.assign(newProgram.nodes, valFrag.nodes);
	}

	for (const [ident, valFrag] of identMap) {
		newProgram.identifiers[ident.id] = Object.assign({}, ident, {
			value: rootNode(valFrag).id
		});

		// update scoped node's boundIdentifiers property
		if (ident.scope) {
			newProgram.nodes[ident.scope] = Object.assign({},
				newProgram.nodes[ident.scope], {
					boundIdentifiers: [
						...newProgram.nodes[ident.scope].boundIdentifiers,
						ident.id
					]
				}
			);
		}
	}

	return newProgram;
}

// Program | ProrgamFragment, [TypeDefinition], [Constructor], [TypeVariable] -> Program | ProgramFragment
function attachTypeDefinitions(frag, typeDefs, cons, typeVars) {
	return Object.assign({}, frag, {
		typeDefinitions: Object.assign({}, frag.typeDefinitions,
			...typeDefs.map(x => ({ [x.id]: x }))),
		constructors: Object.assign({}, frag.constructors,
			...cons.map(x => ({ [x.id]: x }))),
		typeVariables: Object.assign({}, frag.typeVariables,
			...typeVars.map(x => ({ [x.id]: x })))
	});
}

// Identifier, Uid Node -> Identifier
function setIdentifierScope(identifier, scopeId) {
	return Object.assign({}, identifier, { scope: scopeId });
}

// Program, Identifier, Uid Node -> Program
function assignIdentifierScope(program, identifier, scopeId) {
	return Object.assign({}, program, {
		identifiers: Object.assign({}, program.identifiers, {
			[identifier.id]: setIdentifierScope(identifier, scopeId)
		}),
		nodes: Object.assign({}, program.nodes, {
			[scopeId]: Object.assign({}, program.nodes[scopeId], {
				boundIdentifiers: [
					...program.nodes[scopeId].boundIdentifiers,
					identifier.id
				]
			})
		})
	});
}

// Program, Uid Node -> Program
function appendPieceToExp(program, expId) {
	if (program.identifiers[expId]) {
		let ident = getIdentifier(program, expId);
		if (ident.value) {
			return appendPieceToExp(program, ident.value);
		} if (ident.scope) {
			return appendPieceToExp(program, ident.scope);
		} else {
			return program;
		}
	}

	let node = getNode(program, expId);
	let frag;

	switch (getNodeOrExpType(node)) {
		case expressionType.LAMBDA:
			const ident = setIdentifierScope(createIdentifier('x'), expId);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						arguments: [...program.nodes[expId].arguments, ident.id]
					})
				}),
				identifiers: Object.assign({}, program.identifiers, {
					[ident.id]: ident
				})
			});

		case expressionType.APPLICATION:
			frag = _setFragParent(createNumberExpression(0), expId);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						arguments: [...program.nodes[expId].arguments, frag.rootNode]
					})
				}, frag.nodes)
			});

		case expressionType.CONSTRUCTION:
			frag = _setFragParent(createNumberExpression(0), expId);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						parameters: [...program.nodes[expId].parameters, frag.rootNode]
					})
				}, frag.nodes)
			});

		case expressionType.DO:
			frag = _setFragParent(createNumberExpression(0), expId);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						unitExpressions: [
							...program.nodes[expId].unitExpressions,
							frag.rootNode
						]
					})
				}, frag.nodes)
			});

		case expressionType.CASE:
			frag = _setFragParent(
				createCaseBranch(
					createNumberExpression(0),
					createNumberExpression(0)
				),
				expId
			);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						caseBranches: [...program.nodes[expId].caseBranches, frag.rootNode]
					})
				}, frag.nodes)
			});
		default:
			if (node.parent) {
				return appendPieceToExp(program, node.parent);
			}

			return program;
	}
}

// Program, Uid Node -> Program
function removeNode(program, idToRemove) {
	const oldNode = getNode(program, idToRemove);

	switch (getNodeType(oldNode)) {
		case nodeType.CASE_BRANCH:
			if (getNode(program, oldNode.parent).caseBranches.length > 1) {
				break;
			}
			return replaceNode(program, idToRemove, createCaseBranch(
				createNumberExpression(0), createNumberExpression(0)
			));

		case nodeType.EXPRESSION:
			if (oldNode.parent
			 && (
				(getExpressionType(getNode(program, oldNode.parent))
					=== expressionType.APPLICATION
				&& getNode(program, oldNode.parent).arguments.includes(idToRemove))

				|| (getExpressionType(getNode(program, oldNode.parent))
				  === expressionType.DO
				&& getNode(program, oldNode.parent).unitExpressions.includes(idToRemove))

				|| (getExpressionType(getNode(program, oldNode.parent))
				  === expressionType.CONSTRUCTION
				&& getNode(program, oldNode.parent).parameters.includes(idToRemove))
			)) {
				 break;
			}

			if (!oldNode.parent && program.expression !== oldNode.parent) {
				break;
			}

		default:
			return replaceNode(program, idToRemove, createNumberExpression(0));
	}

	const newProg = Object.assign({}, program);
	newProg.identifiers = Object.assign({}, program.identifiers);
	newProg.nodes = Object.assign({}, program.nodes);

	_removeSubtree(newProg, oldNode);

	if (oldNode.parent) {
		const parent = getNode(newProg, oldNode.parent);
		newProg.nodes[parent.id] = _removeNodeChild(parent, idToRemove);
	}

	return newProg;
}

// Program, Uid Node, ProgramFragment -> Program
function replaceNode(program, idToReplace, replaceWith) {
	const oldNode = getNode(program, idToReplace);

	if (getNodeType(oldNode) !== getNodeType(rootNode(replaceWith))) {
		throw `Cannot replace ${getNodeType(oldNode)} with ${getNodeType(rootNode(replaceWith))}`;
	}

	const newProg = Object.assign({}, program);
	newProg.identifiers = Object.assign({}, program.identifiers);
	newProg.nodes = Object.assign({}, program.nodes);

	_removeSubtree(newProg, oldNode);

	if (newProg.expression === idToReplace) {
		newProg.expression = replaceWith.rootNode;
	}

	if (oldNode.parent) {
		const parent = getNode(newProg, oldNode.parent);
		replaceWith = _setFragParent(replaceWith, parent.id);
		newProg.nodes[parent.id] =
			_replaceNodeChild(parent, idToReplace, replaceWith.rootNode);
	}

	Object.assign(newProg.identifiers, replaceWith.identifiers);
	Object.assign(newProg.nodes, replaceWith.nodes);

	for (const identId of Object.keys(newProg.identifiers)) {
		const ident = getIdentifier(newProg, identId);
		if (ident.value === idToReplace) {
			newProg.identifiers[identId] = Object.assign({}, ident, {
				value: replaceWith.rootNode
			});
		}
	}

	return newProg;
}

// Program, Uid Node | Uid Identifier -> Program
function setDisplayName(program, idToName, displayName) {
	if (program.nodes[idToName]) {
		return Object.assign({}, program, {
			nodes: Object.assign({}, program.nodes, {
				[idToName]: Object.assign({}, getNode(program, idToName), {
					displayName: displayName
				})
			})
		});
	} else if (program.identifiers[idToName]) {
		return Object.assign({}, program, {
			identifiers: Object.assign({}, program.identifiers, {
				[idToName]: Object.assign({}, getIdentifier(program, idToName), {
					displayName: displayName
				})
			})
		});
	} else {
		return program;
	}
}

// Program, Uid Identifier -> Program
function removeIdentifier(program, identIdToRemove) {
	const ident = getIdentifier(program, identIdToRemove);

	if (ident.scope) {
		const scopedTo = Object.assign({}, getNode(program, ident.scope));
		if (getExpressionType(scopedTo) === expressionType.LAMBDA
		 && scopedTo.arguments.includes(identIdToRemove)) {
			scopedTo.arguments = scopedTo.arguments.filter(id =>
				id !== identIdToRemove);
		}
		if (scopedTo.boundIdentifiers.includes(identIdToRemove)) {
			scopedTo.boundIdentifiers = scopedTo.boundIdentifiers.filter(id =>
				id !== identIdToRemove);
		}

		program = Object.assign({}, program, {
			nodes: Object.assign({}, program.nodes, {
				[ident.scope]: scopedTo
			})
		});
	}

	if (ident.value) {
		program = removeNode(program, ident.value);
	}

	// remove all IdentifierExpression's referencing identIdToRemove
	for (const nodeId of Object.keys(program)) {
		const node = getNode(program, nodeId);
		if (node && getNodeOrExpType(node) === expressionType.IDENTIFIER
		 && node.identIdToRemove === identIdToRemove) {
			program = removeNode(program, nodeId)
		}
	}

	// remove identifier
	const newIdents = Object.assign({}, program.identifiers);
	delete newIdents[identIdToRemove];
	return Object.assign({}, program, {
		identifiers: newIdents
	});
}

function _setFragParent(frag, parentId) {
	return Object.assign({}, frag, {
		nodes: Object.assign({}, frag.nodes, {
			[frag.rootNode]: Object.assign({}, frag.nodes[frag.rootNode], {
				parent: parentId
			})
		})
	});
}

function _replaceNodeChild(parent, idToReplace, childId) {
	switch (getNodeOrExpType(parent)) {
		case expressionType.LAMBDA:
			return Object.assign({}, parent, {
				body: parent.body === idToReplace ? childId : parent.body
			});
		case expressionType.APPLICATION:
			return Object.assign({}, parent, {
				lambda: parent.lambda === idToReplace ? childId : parent.lambda,
				arguments: parent.arguments.map(id => id === idToReplace ? childId : id)
			});
		case expressionType.CASE:
			return Object.assign({}, parent, {
				elseBranch: parent.elseBranch === idToReplace
					? childId : parent.elseBranch,
				caseBranches: parent.caseBranches.map(id =>
					id === idToReplace ? childId : id)
			});
		case nodeType.CASE_BRANCH:
			return Object.assign({}, parent, {
				condition: parent.condition === idToReplace
					? childId : parent.condition,
				expression: parent.expression === idToReplace
					? childId : parent.expression
			});
		case nodeType.ELSE_BRANCH:
			return Object.assign({}, parent, {
				expression: parent.expression === idToReplace
					? childId : parent.expression
			});
		case expressionType.DO:
			return Object.assign({}, parent, {
				returnExpression: parent.returnExpression === idToReplace
					? childId : parent.returnExpression,
				unitExpressions: parent.unitExpressions.map(id =>
					id === idToReplace ? childId : id)
			});
		case expressionType.CONSTRUCTION:
			return Object.assign({}, parent, {
				parameters: parent.parameters.map(id =>
					id === idToReplace ? childId : id)
			});
		default: throw `Unexpected parent node: ${getNodeOrExpType(parent)}.`;
	}
}

function _removeNodeChild(parent, idToRemove) {
	switch (getNodeOrExpType(parent)) {
		case expressionType.APPLICATION:
			return Object.assign({}, parent, {
				arguments: parent.arguments.filter(id => id !== idToRemove)
			});
		case expressionType.CASE:
			return Object.assign({}, parent, {
				caseBranches: parent.caseBranches.filter(id => id !== idToRemove)
			});
		case expressionType.DO:
			return Object.assign({}, parent, {
				unitExpressions: parent.unitExpressions.filter(id => id !== idToRemove)
			});
		case expressionType.CONSTRUCTION:
			return Object.assign({}, parent, {
				parameters: parent.parameters.filter(id => id !== idToRemove)
			});
		default:
			throw `Cannot remove child from parent node: ${getNodeOrExpType(parent)}.`;
	}
}

// Removes a node and its entire subtree. Also removes identifiers
// scoped to the node or any node in the subtree.
// WARNING: Mutates program.nodes and program.identifiers
function _removeSubtree(program, node) {
	for (const ident of getIdentifiersScopedToNode(program, node.id)) {
		if (ident.value) {
			_removeSubtree(program, ident.value);
		}
		delete program.identifiers[ident.id];
	}
	delete program.nodes[node.id];
	for (const childId of getChildrenIds(node)) {
		_removeSubtree(program, getNode(program, childId));
	}
}

function wrapExpInDo(program, expId) {
	const parent = getNode(program, expId).parent;
	const frag = createDoExpression([], extractFragment(program, expId));
	const newProgram = Object.assign({}, program, {
		nodes: Object.assign({}, program.nodes, frag.nodes)
	});

	if (parent) {
		newProgram.nodes[parent] = _replaceNodeChild(
			getNode(program, parent), expId, frag.rootNode);
	}

	if (newProgram.expression === expId) {
		newProgram.expression = frag.rootNode;
	}

	return newProgram;
}

// Program, Uid Entity, TypeInstance -> Program
function setType(program, entityId, type) {
	return Object.assign({}, program, {
		types: Object.assign({}, program.types, {
			[entityId]: type
		})
	});
}

module.exports = {
	bindIdentifier, bindIdentifiers, setIdentifierScope,
	replaceNode, removeNode, appendPieceToExp,
	removeIdentifier, setDisplayName,
	attachTypeDefinitions,
	wrapExpInDo,
	setType
};
