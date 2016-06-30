const { astType, nodeType, expressionType } = require('./typeNames');

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
	const node = getNode(program, nodeId);
	const identIds = getExpressionType(node) === expressionType.LAMBDA
		? [...node.boundIdentifiers, ...node.arguments]
		: node.boundIdentifiers
	return identIds.map(identId => getIdentifier(program, identId));
}

// Program, Uid Node -> [Identifier]
function getBoundIdentifiers(program, nodeId) {
	return getNode(program, nodeId).boundIdentifiers.map(identId =>
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

module.exports = {
	rootNode, root, getAstType, getNodeType,
	getExpressionType, getNodeOrExpType,
	getIdentifier, getNode, getRootScopeLambdaIdentifiers,
	isInfixOperator, isLeafExpression,
	getIdentifiersScopedToNode, getBoundIdentifiers,
	getChildrenIds,
	getNodeToTheLeft, getNodeToTheRight,
	getNodeInside, getNodeOutside
};
