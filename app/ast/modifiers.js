const { astType, nodeType, expressionType } = require('./typeNames');
const {
	rootNode,
	getIdentifiersScopedToNode,
	getChildrenIds,
	getNode, getIdentifier,
	getNodeOrExpType, getNodeType, getExpressionType,
	extractFragment,
	getBasisEntity,
	getEntity,
	matchTypes,
	getFinalType
} = require('./accessors');
const {
	createNumberExpression,
	createCaseBranch,
	createIdentifier,
	createDoExpression,
	createDefaultExpression,
	createTypeInstance,
	createIdentifierExpression,
	createApplicationExpression,
	createTypeVariable,
	createConstructionExpression,
	createDeconstructionExpression,
	createDeconstructionCase
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
	newProgram.types[identifier.id] = valueExpFrag.types[valueExpFrag.rootNode];

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

	return Object.assign(newProgram, {
		constructors: Object.assign({},
			newProgram.constructors, valueExpFrag.constructors),
		typeDefinitions: Object.assign({},
			newProgram.typeDefinitions, valueExpFrag.typeDefinitions),
		typeVariables: Object.assign({},
			newProgram.typeVariables, valueExpFrag.typeVariables),
		types: Object.assign({},
			newProgram.types, valueExpFrag.types)
	});
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
		newProgram.types[ident.id] = valFrag.types[valFrag.rootNode];

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

	const frags = identMap.map(pair => pair[1]);
	return Object.assign(newProgram, {
		constructors: Object.assign({},
			newProgram.constructors, ...frags.map(frag => frag.constructors)),
		typeDefinitions: Object.assign({},
			newProgram.typeDefinitions, ...frags.map(frag => frag.typeDefinitions)),
		typeVariables: Object.assign({},
			newProgram.typeVariables, ...frags.map(frag => frag.typeVariables)),
		types: Object.assign({},
			newProgram.types, ...frags.map(frag => frag.types))
	});;
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
	const {
		tCreateCaseBranch,
		tCreateCaseExpression,
		tCreateDoExpression
	} = require('./typedConstructors');
	const basis = require('basis');

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
			const tVar = createTypeVariable();
			const newLamType = Object.assign(program.types[node.id], {
				parameters: [
					...program.types[node.id].parameters.slice(0, -1),
					createTypeInstance(tVar.id),
					...program.types[node.id].parameters.slice(-1)
				]
			});
			// HACK
			const identId = Object.keys(program.identifiers).filter(identId =>
				program.identifiers[identId].value === node.id);
			return attachTypeDefinitions(
				setTypes(
					Object.assign({}, program, {
						nodes: Object.assign({}, program.nodes, {
							[expId]: Object.assign({}, program.nodes[expId], {
								arguments: [...program.nodes[expId].arguments, ident.id]
							})
						}),
						identifiers: Object.assign({}, program.identifiers, {
							[ident.id]: ident
						})
					}), [
						[ident.id, createTypeInstance(tVar.id)],
						[node.id, newLamType],
						[identId, newLamType]
					]
				), [], [], [tVar]
			);

		case expressionType.DO:
			frag = _setFragParent(
				setType(
					createDefaultExpression(),
					createTypeInstance(
						getBasisEntity(program, basis.typeDefinitions.Unit).id
					)
				),
				expId
			);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						unitExpressions: [
							...program.nodes[expId].unitExpressions,
							frag.rootNode
						]
					})
				}, frag.nodes),
				types: Object.assign({}, program.types, frag.types)
			});

		case expressionType.CASE:
			frag = _setFragParent(
				tCreateCaseBranch(
					setType(
						createDefaultExpression(),
						createTypeInstance(
							getBasisEntity(program, basis.typeDefinitions.Bool).id
						)
					),
					setType(createDefaultExpression(), program.types[node.id])
				),
				expId
			);
			return Object.assign({}, program, {
				nodes: Object.assign({}, program.nodes, {
					[expId]: Object.assign({}, program.nodes[expId], {
						caseBranches: [...program.nodes[expId].caseBranches, frag.rootNode]
					})
				}, frag.nodes),
				types: Object.assign({}, program.types, frag.types)
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
			return program;

		case nodeType.EXPRESSION:
			if (oldNode.parent
			 &&
				(getExpressionType(getNode(program, oldNode.parent))
				=== expressionType.DO
				&& getNode(program, oldNode.parent).unitExpressions.includes(idToRemove))
			) {
				break;
			}

		default:
			return program;
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
	newProg.typeDefinitions =
		Object.assign({}, program.typeDefinitions, replaceWith.typeDefinitions);
	newProg.constructors =
		Object.assign({}, program.constructors, replaceWith.constructors);
	newProg.typeVariables =
		Object.assign({}, program.typeVariables, replaceWith.typeVariables);
	newProg.types =
		Object.assign({}, program.types, replaceWith.types);

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
		const scopedToT = getFinalType(program,
			Object.assign({}, program.types[scopedTo.id]));

		if (getExpressionType(scopedTo) === nodeType.DECONSTRUCTION_CASE
		 && scopedTo.parameterIdentifiers.includes(identIdToRemove)) {
			return program;
		}

		if (getExpressionType(scopedTo) === expressionType.LAMBDA
		 && scopedTo.arguments.includes(identIdToRemove)) {
			scopedToT.parameters = [
				...scopedToT.parameters.slice(0,
						scopedTo.arguments.indexOf(identIdToRemove)),
				...scopedToT.parameters.slice(0,
						scopedTo.arguments.indexOf(identIdToRemove) + 1)
			];

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
			}),
			types: Object.assign({}, program.types, {
				[ident.scope]: scopedToT
			})
		});
	}

	if (ident.value) {
		program = removeNode(program, ident.value);
	}

	// remove all IdentifierExpression's referencing identIdToRemove
	for (const nodeId of Object.keys(program.nodes)) {
		const node = getNode(program, nodeId);
		if (node && getNodeOrExpType(node) === expressionType.IDENTIFIER
		 && node.identifier === identIdToRemove) {
			program = replaceNode(program, nodeId, setType(
				createDefaultExpression(),
				program.types[ident.id]
			));
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
		case expressionType.DECONSTRUCTION:
			return Object.assign({}, parent, {
				dataExpression: parent.dataExpression === idToReplace
					? childId : parent.dataExpression,
				cases: parent.cases.map(id => id === idToReplace ? childId : id)
			});
		case nodeType.DECONSTRUCTION_CASE:
			return Object.assign({}, parent, {
				constructor: parent.constructor === idToReplace
					? childId : parent.constructor,
				expression: parent.expression === idToReplace
					? childId : parent.expression,
				parameterIdentifiers: parent.parameterIdentifiers.map(id =>
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
			_removeSubtree(program, getEntity(program, ident.value));
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
// OR: Program, TypeInstance -> Program
function setType(program, entityId, type) {
	if (typeof type === 'undefined') {
		type = entityId;
		entityId = program.rootNode || program.expression;
	}
	return Object.assign({}, program, {
		types: Object.assign({}, program.types, {
			[entityId]: type
		})
	});
}

// Program, [[Uid Entity, TypeInstance]] -> Program
function setTypes(program, types) {
	const newProgram = Object.assign({}, program, {
		types: Object.assign({}, program.types)
	});
	for (const [entityId, typeInstance] of types) {
		newProgram.types[entityId] = typeInstance;
	}
	return newProgram;
}

function mergeFragments(rootNodeId, ...frags) {
	const oa = Object.assign;
	return {
		astType: astType.PROGRAM_FRAGMENT,
		rootNode: rootNodeId,
		nodes: oa({}, ...frags.map(f => f.nodes)),
		identifiers: oa({}, ...frags.map(f => f.identifiers)),
		constructors: oa({}, ...frags.map(f => f.constructors)),
		typeDefinitions: oa({}, ...frags.map(f => f.typeDefinitions)),
		typeVariables: oa({}, ...frags.map(f => f.typeVariables)),
		types: oa({}, ...frags.map(f => f.types))
	};
}

function copyTypeWithNewVars(program, type, mappedVars={}) {
	mappedVars = Object.assign({}, mappedVars);
	type = getFinalType(program, type);
	if (program.typeVariables[type.typeDefinition]) {
		const tVar = mappedVars[type.typeDefinition] || createTypeVariable();
		mappedVars[type.typeDefinition] = tVar;
		return {
			newType: createTypeInstance(tVar.id),
			newTypeVariables: [tVar],
			mappedVars
		};
	} else {
		const tVars = [];
		const newParams = [];
		for (const paramType of type.parameters) {
			const { newType, newTypeVariables, mappedVars: newMappedVars } =
				copyTypeWithNewVars(program, paramType, mappedVars);
			tVars.push(...newTypeVariables);
			newParams.push(newType);
			Object.assign(mappedVars, newMappedVars);
		}
		return {
			newType: createTypeInstance(type.typeDefinition, newParams),
			newTypeVariables: tVars,
			mappedVars
		};
	}
}

function createTypeDefType(program, typeDefId) {
	const typeDef = getEntity(program, typeDefId);
	return copyTypeWithNewVars(
		program,
		createTypeInstance(
			typeDefId,
			typeDef.parameters.map(tVarId => createTypeInstance(tVarId))
		)
	);
}

function executeInsert(program, nodeType, valueish, idToReplace) {
	const {
		tCreateCaseBranch,
		tCreateCaseExpression,
		tCreateDoExpression
	} = require('./typedConstructors');

	const fragToReplace = extractFragment(program, idToReplace);
	const slotType = program.types[idToReplace];
	const basis = require('basis');

	let replacement;
	let replacementType;

	switch (nodeType) {
		case expressionType.CASE:
			replacementType = slotType;
			replacement = tCreateCaseExpression(
				[tCreateCaseBranch(
					setType(createDefaultExpression(), createTypeInstance(
						getBasisEntity(program, basis.typeDefinitions.Bool).id
					)),
					setType(createDefaultExpression(), slotType)
				)],
				fragToReplace
			);
			break;

		case expressionType.DO:
			replacementType = slotType;
			replacement = tCreateDoExpression([], fragToReplace);
			break;

		case expressionType.NUMBER:
			replacementType = createTypeInstance(
				getBasisEntity(program, basis.typeDefinitions.Number).id);
			replacement = setType(
				createNumberExpression(valueish),
				replacementType
			);
			break;

		case expressionType.IDENTIFIER: {
			const lambdaTId = getBasisEntity(
				program, basis.typeDefinitions.Lambda).id;
			const identType = getFinalType(program, program.types[valueish]);
			let newTVars = [];
			if (identType.typeDefinition === lambdaTId) {
				const {
					newType,
					newTypeVariables
				} = copyTypeWithNewVars(program, identType);
				replacementType = newType;
				newTVars = newTypeVariables;
			} else {
				replacementType = identType;
			}
			replacement = attachTypeDefinitions(
				setType(
					createIdentifierExpression(program.identifiers[valueish]),
					replacementType
				),
				[], [], newTVars
			);
			break;
		}

		case expressionType.APPLICATION: {
			const {
				newType: lamType,
				newTypeVariables
			} = copyTypeWithNewVars(program,
				getFinalType(program, program.types[valueish]));
			replacementType = lamType.parameters[lamType.parameters.length - 1];
			replacement = attachTypeDefinitions(
				setType(
					createApplicationExpression(
						setType(
							createIdentifierExpression(program.identifiers[valueish]),
							lamType
						),
						lamType.parameters.slice(0, -1).map(paramType =>
							setType(createDefaultExpression(), paramType))
					),
					replacementType
				), [], [], newTypeVariables
			);
			break;
		}

		case expressionType.CONSTRUCTION: {
			const constructor = program.constructors[valueish];
			const { newType, newTypeVariables, mappedVars } =
				createTypeDefType(program, constructor.typeDefinition);
			replacementType = newType;
			replacement = attachTypeDefinitions(
				setType(
					createConstructionExpression(
						constructor,
						constructor.parameterTypes.map(paramType =>
							setType(
								createDefaultExpression(),
								copyTypeWithNewVars(program, paramType, mappedVars).newType
							)
						)
					),
					replacementType
				), [], [], newTypeVariables
			);
			break;
		}

		case expressionType.DECONSTRUCTION: {
			const { newType, newTypeVariables, mappedVars } =
				createTypeDefType(program, valueish);
			const typeDef = getEntity(program, valueish);
			const identIdToType = {};
			replacementType = slotType;
			replacement = attachTypeDefinitions(
				setType(
					createDeconstructionExpression(
						setType(createDefaultExpression(), newType),
						typeDef.constructors.map((cId, j) => {
							const cons = getEntity(program, cId);
							return setType(
								createDeconstructionCase(
									cons,
									cons.parameterTypes.map((paramType, i) => {
										const ident = createIdentifier('x' + j + i);
										const typeCopy = copyTypeWithNewVars(
											program,
											paramType,
											mappedVars
										);
										identIdToType[ident.id] = typeCopy.newType;
										return ident;
									}),
									setType(createDefaultExpression(), replacementType)
								),
								replacementType
							);
						})
					),
					replacementType
				), [], [], newTypeVariables
			);
			for (const identId of Object.keys(identIdToType)) {
				replacement = setType(
					replacement,
					identId,
					identIdToType[identId]
				);
			}
			break;
		}

		default:
			throw `Cant handle ${nodeType} in insert operation yet`;
	}

	const typeMatch = matchTypes(program, slotType, replacementType);
	if (typeMatch === false) { throw `Incompatible types!`; }
	const { typeVarTypes, newTypeVars } = typeMatch;
	replacement = attachTypeDefinitions(replacement, [], [], newTypeVars);
	for (const tVarId of Object.keys(typeVarTypes)) {
		replacement = setType(
			replacement,
			tVarId,
			typeVarTypes[tVarId]
		);
	}

	return {
		newProgram: replaceNode(program, idToReplace, replacement),
		replacementId: replacement.rootNode
	};
}

module.exports = {
	bindIdentifier, bindIdentifiers, setIdentifierScope,
	replaceNode, removeNode, appendPieceToExp,
	removeIdentifier, setDisplayName,
	attachTypeDefinitions,
	wrapExpInDo,
	setType, setTypes,
	mergeFragments,
	executeInsert,
	createTypeDefType
};
