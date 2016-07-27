const { astType, nodeType, expressionType } = require('./typeNames');
const {
	createTypeVariable,
	createTypeInstance
} = require('./constructors');

// ProgramFragment -> Node
function rootNode(frag) {
	return frag.nodes[frag.rootNode];
}

// Program -> Expression
function root(program) {
	return program.nodes[program.expression];
}

const getAstType = x => x.astType;
const getNodeType = x => x.nodeType;
const getExpressionType = x => x.expressionType;
const getNodeOrExpType = x => {
	if (x.nodeType === nodeType.EXPRESSION) {
		return x.expressionType;
	}
	return x.nodeType;
};

const getIdentifier = (program, identId) =>
	program.identifiers[identId];
const getNode = (program, nodeId) =>
	program.nodes[nodeId];

const isLeafExpression = node => [
	expressionType.IDENTIFIER, expressionType.NUMBER
].includes(getNodeOrExpType(node));

// Program -> [Identifier]
function getRootScopeLambdaIdentifiers(program) {
	const result = [];
	for (const identId of Object.keys(program.identifiers)) {
		const identifier = getIdentifier(program, identId);
		if (identifier.scope !== null || !identifier.value) {
			continue;
		}
		const valueExp = getNode(program, identifier.value);
		if (getExpressionType(valueExp) === expressionType.LAMBDA) {
			result.push(identifier);
		}
	}
	return result;
}

// Identifier -> Boolean
function isInfixOperator(identifier) {
	return /^[^a-z0-9\s]+$/.test(identifier.displayName);
}

// Program, Uid Node -> [Identifier]
function getIdentifiersScopedToNode(program, nodeId) {
	const node = getEntity(program, nodeId);
	let toAdd = [];
	switch (getEntityType(node)) {
		case expressionType.LAMBDA:
			toAdd = [...node.arguments]; break;
		case nodeType.DECONSTRUCTION_CASE:
			toAdd = [...node.parameterIdentifiers]; break;
	}
	toAdd = toAdd.map(identId => getIdentifier(program, identId))
	return getBoundIdentifiers(program, nodeId).concat(toAdd);
}

// Program -> [Identifier]
function getRootScopeIdentifiers(program) {
	return Object.values(program.identifiers)
		.filter(ident => ident.scope === null);
}

// Program, Uid Node -> [Identifier]
function getBoundIdentifiers(program, nodeId) {
	return getEntity(program, nodeId).boundIdentifiers.map(identId =>
		getIdentifier(program, identId));
}

// Node -> [Uid Node]
function getChildrenIds(node) {
	switch (getNodeOrExpType(node)) {
		case expressionType.NUMBER: return [];
		case expressionType.IDENTIFIER: return [];
		case expressionType.LAMBDA: return [node.body];
		case expressionType.APPLICATION: return [node.lambda, ...node.arguments];
		case expressionType.CASE: return [...node.caseBranches, node.elseBranch];
		case nodeType.CASE_BRANCH: return [node.condition, node.expression];
		case nodeType.ELSE_BRANCH: return [node.expression];
		case expressionType.DO:
			return [...node.unitExpressions, node.returnExpression];
		case expressionType.DEFAULT: return [];
		case expressionType.CONSTRUCTION: return node.parameters;
		case expressionType.DECONSTRUCTION:
			return [node.dataExpression, ...node.cases];
		case nodeType.DECONSTRUCTION_CASE: return [node.expression];
		default: throw `Unexpected node: ${getNodeOrExpType(node)}.`;
	}
}

// Program, Uid Node | Uid Identifier, Maybe Boolean -> [Uid Node | Uid Identifier]
function _getSubIdsInOrder(program, nodeId, ignoreInfix = false) {
	if (program.identifiers[nodeId]) return [];

	const node = getNode(program, nodeId);
	switch (getNodeOrExpType(node)) {
		case expressionType.NUMBER: return [];
		case expressionType.IDENTIFIER: return [];
		case expressionType.LAMBDA: return [...node.arguments, node.body];
		case expressionType.APPLICATION:
			if (!ignoreInfix
			 && node.arguments.length === 2
			 && getExpressionType(getNode(program, node.lambda)) === expressionType.IDENTIFIER
			 && isInfixOperator(getIdentifier(program, getNode(program, node.lambda).identifier))) {
				return [node.arguments[0], node.lambda, node.arguments[1]];
			} else {
				return [node.lambda, ...node.arguments];
			}
		case expressionType.CASE: return [...node.caseBranches, node.elseBranch];
		case nodeType.CASE_BRANCH: return [node.condition, node.expression];
		case nodeType.ELSE_BRANCH: return [node.expression];
		case expressionType.CONSTRUCTION: return node.parameters;
		case expressionType.DECONSTRUCTION:
			return [node.dataExpression, ...node.cases];
		case nodeType.DECONSTRUCTION_CASE:
			return [...node.parameterIdentifiers, node.expression];
		case expressionType.DO:
			return [...node.unitExpressions, node.returnExpression];
		case expressionType.DEFAULT: return [];
		case expressionType.CONSTRUCTION: return node.parameters;
		case expressionType.DECONSTRUCTION:
			return [node.dataExpression, ...node.cases];
		case nodeType.DECONSTRUCTION_CASE:
			return [...node.parameterIdentifiers, node.expression];
		default: throw `Unexpected node: ${getNodeOrExpType(node)}.`;
	}
}

// Program, Uid Node, Maybe Boolean -> Uid Node
function getNodeToTheLeft(program, nodeId, ignoreInfix = false) {
	if (program.identifiers[nodeId]) return nodeId;
	const node = getNode(program, nodeId);
	if (!node.parent) return nodeId;
	const parent = getNode(program, node.parent);
	if (getExpressionType(parent) === expressionType.LAMBDA
	 && !parent.parent) {
		return nodeId;
	}
	const subIds = _getSubIdsInOrder(program, parent.id, ignoreInfix);
	const selfIndex = subIds.indexOf(nodeId);
	if (selfIndex === 0) {
		return parent.id;
	} else {
		return subIds[selfIndex - 1];
	}
}

// Program, Uid Node, Maybe Boolean -> Uid Node
function getNodeToTheRight(program, nodeId, ignoreInfix = false) {
	if (program.identifiers[nodeId]) return nodeId;
	const node = getNode(program, nodeId);
	if (!node.parent) return nodeId;
	const parent = getNode(program, node.parent);
	if (getExpressionType(parent) === expressionType.LAMBDA
	 && !parent.parent) {
		return nodeId;
	}
	const subIds = _getSubIdsInOrder(program, parent.id, ignoreInfix);
	const selfIndex = subIds.indexOf(nodeId);
	if (selfIndex < subIds.length - 1) {
		return subIds[selfIndex + 1];
	} else {
		return parent.id;
	}
}

// Program, Uid Node -> Uid Node
function getNodeInside(program, nodeId, ignoreInfix = false) {
	const subIds = _getSubIdsInOrder(program, nodeId, ignoreInfix);
	return subIds.length === 0 ? nodeId : subIds[0];
}

// Program, Uid Node -> Uid Node
function getNodeOutside(program, nodeId) {
	if (program.identifiers[nodeId]) return nodeId;
	const node = getNode(program, nodeId);
	if (node.parent) {
		const parent = getNode(program, node.parent);
		if (getExpressionType(parent) === expressionType.LAMBDA
		 && !parent.parent) {
			return nodeId;
		} else {
			return parent.id;
		}
	} else {
		return nodeId;
	}
}

function getEntity(program, id) {
	if (program.types === undefined) console.error(program);
	return program.nodes[id]
	    || program.identifiers[id]
	    || program.constructors[id]
		  || program.typeDefinitions[id]
		  || program.typeVariables[id];
}

function getEntityType(entity) {
	return entity.expressionType
	    || entity.nodeType
			|| entity.astType;
}

function _getDependencies(program, entityId, _ids = new Set()) {
	const e = getEntity(program, entityId);
	if (typeof e === 'undefined') { return _ids; }
	_ids.add(e.id);
	const idsToSee = [];

	switch (getEntityType(e)) {
		case astType.IDENTIFIER:
			e.scope && idsToSee.push(e.scope);
			e.value && idsToSee.push(e.value);
			break;
		case astType.CONSTRUCTOR:
			e.typeDefinition && idsToSee.push(e.typeDefinition);
			break;
		case astType.TYPE_DEFINITION:
			idsToSee.push(...e.constructors, ...e.parameters);
			break;
		case astType.TYPE_VARIABLE: break;
		case nodeType.CASE_BRANCH:
			idsToSee.push(e.condition, e.expression);
			break;
		case nodeType.ELSE_BRANCH:
			idsToSee.push(e.expression);
			break;
		case nodeType.DECONSTRUCTION_CASE:
			idsToSee.push(e.constructor, e.expression, ...e.parameterIdentifiers);
			break;
		case expressionType.NUMBER: break;
		case expressionType.IDENTIFIER:
			idsToSee.push(e.identifier);
			break;
		case expressionType.LAMBDA:
			idsToSee.push(e.body, ...e.arguments);
			break;
		case expressionType.APPLICATION:
			idsToSee.push(e.lambda, ...e.arguments);
			break;
		case expressionType.CASE:
			idsToSee.push(e.elseBranch, ...e.caseBranches);
			break;
		case expressionType.CONSTRUCTION:
			idsToSee.push(e.constructor, ...e.parameters);
			break;
		case expressionType.DECONSTRUCTION:
			idsToSee.push(e.dataExpression, ...e.cases);
			break;
		case expressionType.DEFAULT: break;
		case expressionType.BUILT_IN_FUNCTION: break;
		case expressionType.DO:
			idsToSee.push(e.returnExpression, ...e.unitExpressions);
			break;

		case astType.PROGRAM:
		case astType.PROGRAM_FRAGMENT:
		case astType.NODE:
		case astType.TYPE_INSTANCE:
		case nodeType.EXPRESSION:
		default: throw `Unexpected entity: ${getEntityType(e)}.`;
	}

	for (const id of idsToSee) {
		if (_ids.has(id)) { continue; }
		_getDependencies(program, id, _ids);
	}

	return _ids;
}

// Program, Uid Node -> ProgramFragment
function extractFragment(program, nodeId) {
	const ids = _getDependencies(program, nodeId);
	const frag = {
		astType: astType.PROGRAM_FRAGMENT,
		rootNode: nodeId,
		nodes: {},
		identifiers: {},
		constructors: {},
		typeDefinitions: {},
		typeVariables: {},
		types: {}
	};
	const props = {
		[astType.IDENTIFIER]: 'identifiers',
		[astType.NODE]: 'nodes',
		[astType.CONSTRUCTOR]: 'constructors',
		[astType.TYPE_DEFINITION]: 'typeDefinitions',
		[astType.TYPE_VARIABLE]: 'typeVariables'
	}

	for (const id of ids) {
		const entity = getEntity(program, id);
		frag[props[getAstType(entity)]][id] = entity;
		if (program.types[id]) {
			frag.types[id] = program.types[id];
		}
	}

	return frag;
}

// Program, Uid Entity -> TypeInstance?
function getType(program, entityId) {
	return program.types[entityId] || null;
}

// Program, Uid Node -> [Identifier]
function getVisibleIdentifiers(program, nodeId) {
	const idents = [];
	while (nodeId) {
		const node = getEntity(program, nodeId);
		if (getEntityType(node) === astType.IDENTIFIER) {
			nodeId = node.scope;
			continue;
		}
		idents.push(...getIdentifiersScopedToNode(program, nodeId))
		nodeId = node.parent;
		if (!nodeId) {
			const idents = Object.keys(program.identifiers).filter(identId => {
				const e = getEntity(program, identId);
				return e && e.scope && e.value === node.id;
			});
			if (idents.length) {
				nodeId = idents[0];
			}
		}
	}
	return idents.concat(getRootScopeIdentifiers(program));
}

// Program, TypeInstance -> String
function typeString(program, type) {
	if (type == null) return 'no type';

	let str = '';
	type = getFinalType(program, type);
	const typeDef = getEntity(program, type.typeDefinition);
	str += typeDef.displayName || typeDef.id.slice(-4);
	for (const paramType of type.parameters) {
		str += ' (' + typeString(program, paramType) + ')';
	}
	return str;
}

function getBasisEntity(program, basisEntity) {
	switch (getEntityType(basisEntity)) {
		case astType.TYPE_DEFINITION:
			for (const id of Object.keys(program.typeDefinitions)) {
				const typeDef = program.typeDefinitions[id];
				if (typeDef.displayName === basisEntity.displayName) {
					return typeDef;
				}
			}
		case astType.CONSTRUCTOR:
			for (const id of Object.keys(program.constructors)) {
				const cons = program.constructors[id];
				if (cons.displayName === basisEntity.displayName) {
					return cons;
				}
			}
		default:
			throw `Unexpected basis entity in lookup.`;
	}
}

function getFinalType(program, type) {
	if (program.types[type.typeDefinition]) {
		return getFinalType(
			program, program.types[type.typeDefinition]);
	}
	return type;
}

function matchTypes(program, typeA, typeB, extraTypeVarMap={}) {
	typeA = getFinalType(program, typeA);
	typeB = getFinalType(program, typeB);
	if (extraTypeVarMap[typeA.typeDefinition]) {
		typeA = getFinalType(program, extraTypeVarMap[typeA.typeDefinition]);
	}
	if (extraTypeVarMap[typeB.typeDefinition]) {
		typeB = getFinalType(program, extraTypeVarMap[typeB.typeDefinition]);
	}
	const isTypeAVar = !program.typeDefinitions[typeA.typeDefinition];
	const isTypeBVar = !program.typeDefinitions[typeB.typeDefinition];

	const typeVarTypes = {};
	const newTypeVars = [];

	if (isTypeAVar && isTypeBVar) {
		const newTypeVar = createTypeVariable();
		newTypeVars.push(newTypeVar);
		typeVarTypes[typeA.typeDefinition] = createTypeInstance(newTypeVar.id);
		typeVarTypes[typeB.typeDefinition] = createTypeInstance(newTypeVar.id);
	} else if (isTypeAVar) {
		typeVarTypes[typeA.typeDefinition] = typeB;
	} else if (isTypeBVar) {
		typeVarTypes[typeB.typeDefinition] = typeA;
	} else {
			if (typeA.typeDefinition !== typeB.typeDefinition) { return false; }
			if (typeA.parameters.length !== typeB.parameters.length) { return false; }
			for (let i = 0; i < typeA.parameters.length; i++) {
				const paramMatch = matchTypes(
					program, typeA.parameters[i], typeB.parameters[i], typeVarTypes
				);
				if (paramMatch === false) { return false; }
				Object.assign(typeVarTypes, paramMatch.typeVarTypes);
				newTypeVars.push(...paramMatch.newTypeVars)
			}
	}

	return { typeVarTypes, newTypeVars };
}

module.exports = {
	rootNode,
	root,
	getAstType,
	getNodeType,
	getEntityType,
	getExpressionType,
	getNodeOrExpType,
	getIdentifier,
	getNode,
	getRootScopeLambdaIdentifiers,
	isInfixOperator,
	isLeafExpression,
	getIdentifiersScopedToNode,
	getBoundIdentifiers,
	getChildrenIds,
	getNodeToTheLeft,
	getNodeToTheRight,
	getNodeInside,
	getNodeOutside,
	extractFragment,
	getVisibleIdentifiers,
	getRootScopeIdentifiers,
	getEntity,
	getType,
	typeString,
	getBasisEntity,
	matchTypes,
	getFinalType
};
