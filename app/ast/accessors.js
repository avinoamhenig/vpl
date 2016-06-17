const assert = require('assert');
const { astType, nodeType, expressionType } = require('./typeNames');

// ProgramFragment -> Node
function rootNode(frag) {
	assert.strictEqual(frag.astType, astType.PROGRAM_FRAGMENT);
	return frag.nodes[frag.rootNode];
}

// Program -> Expression
function root(program) {
	assert.strictEqual(program.astType, astType.PROGRAM);
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

module.exports = {
	rootNode, root, getAstType, getNodeType,
	getExpressionType, getNodeOrExpType,
	getIdentifier, getNode
};
