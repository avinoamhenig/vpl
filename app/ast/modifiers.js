const assert = require('assert');
const { astType, nodeType, expressionType } = require('./typeNames');
const {
	rootNode,
	getIdentifiersScopedToNode,
	getChildrenIds,
	getNode, getIdentifier,
	getNodeOrExpType, getNodeType, getExpressionType
} = require('./accessors');
const {
	createNumberExpression,
	createCaseBranch
} = require('./constructors');

// Program | ProgramFragment, Identifier, ProgramFragment -> Program | ProgramFragment
function bindIdentifier(program, identifier, valueExpFrag) {
	assert([astType.PROGRAM, astType.PROGRAM_FRAGMENT].includes(program.astType),
		`Cannot set binding on ${program.astType}.`);
	assert.strictEqual(identifier.astType, astType.IDENTIFIER);
	assert.strictEqual(valueExpFrag.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(valueExpFrag).nodeType, nodeType.EXPRESSION);

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

	// update scoped node's scopedIdentifiers property
	if (identifier.scope) {
		newProgram.nodes[identifier.scope] = Object.assign({},
			newProgram.nodes[identifier.scope], {
				scopedIdentifiers: [
					...newProgram.nodes[identifier.scope].scopedIdentifiers,
					identifier.id
				]
			}
		);
	}

	return newProgram;
}

// Program | ProgramFragment, [[Identifier, ProgramFragment]] -> Program | ProgramFragment
function bindIdentifiers(program, identMap) {
	assert([astType.PROGRAM, astType.PROGRAM_FRAGMENT].includes(program.astType),
		`Cannot set bindings on ${program.astType}.`);

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

		// update scoped node's scopedIdentifiers property
		if (ident.scope) {
			newProgram.nodes[ident.scope] = Object.assign({},
				newProgram.nodes[ident.scope], {
					scopedIdentifiers: [
						...newProgram.nodes[ident.scope].scopedIdentifiers,
						ident.id
					]
				}
			);
		}
	}

	return newProgram;
}

// Identifier, Uid Node -> Identifier
function setIdentifierScope(identifier, scopeId) {
	assert.strictEqual(identifier.astType, astType.IDENTIFIER);

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
				scopedIdentifiers: [
					...program.nodes[scopeId].scopedIdentifiers,
					identifier.id
				]
			})
		})
	});
}

// Program, Uid Node -> Program
function appendPieceToExp(program, expId) {
	const node = getNode(program, expId);
	let frag;
	switch (getNodeOrExpType(node)) {
		case expressionType.APPLICATION:
			frag = _setFragParent(createNumberExpression(0), expId);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						arguments: [...program.nodes[expId].arguments, frag.rootNode]
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
			throw `Cannot append piece to ${getNodeOrExpType(node)}`;
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
			throw `Can't remove only branch in case expression.`;
		case nodeType.EXPRESSION:
			if (oldNode.parent
			 && getExpressionType(getNode(program, oldNode.parent))
			   === expressionType.APPLICATION
			 && getNode(program, oldNode.parent).arguments.includes(idToRemove)
			) {
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
		program = Object.assign({}, program, {
			nodes: Object.assign({}, program.nodes, {
				[ident.scope]: Object.assign({},
					program.nodes[ident.scope], {
						scopedIdentifiers:
							program.nodes[ident.scope].scopedIdentifiers.filter(
								id => id !== identIdToRemove
							)
					}
				)
			})
		});
	}

	// remove all IdentifierExpression's referencing identIdToRemove
	for (const nodeId of Object.keys(program)) {
		const node = getNode(program, nodeId);
		if (node && getNodeOrExpType(node) === expressionType.IDENTIFIER
		 && node.identIdToRemove === identIdToRemove) {
			program = removeNode(program, nodeId)
		}
	}

	program = removeNode(program, ident.value);

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
		default:
			throw `Cannot remove child from parent node: ${getNodeOrExpType(parent)}.`;
	}
}

// Removes a node and its entire subtree. Also removes identifiers
// scoped to the node or any node in the subtree.
// WARNING: Mutates program.nodes and program.identifiers
function _removeSubtree(program, node) {
	for (const ident of getIdentifiersScopedToNode(program, node.id)) {
		_removeSubtree(program, ident.value);
		delete program.identifiers[ident.id];
	}
	delete program.nodes[node.id];
	for (const childId of getChildrenIds(node)) {
		_removeSubtree(program, getNode(program, childId));
	}
}

module.exports = {
	bindIdentifier, bindIdentifiers, setIdentifierScope,
	replaceNode, removeNode, appendPieceToExp,
	removeIdentifier, setDisplayName
};
