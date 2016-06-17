const assert = require('assert');
const {
	root,
	getAstType, getNodeOrExpType, getExpressionType,
	astType, nodeType, expressionType,
	getIdentifier, getNode
} = require('../../app/ast');

module.exports = program => {
	assert.strictEqual(getAstType(program), astType.PROGRAM);

	const fnDefs = [];

	for (const identId of Object.keys(program.identifiers)) {
		const identifier = getIdentifier(program, identId);
		if (identifier.scope !== null || !identifier.value) {
			continue;
		}
		const valueExp = getNode(program, identifier.value);
		if (getExpressionType(valueExp) === expressionType.LAMBDA) {
			fnDefs.push({
				name: identifier.displayName,
				args: valueExp.arguments.map(argId =>
					getIdentifier(program, argId).displayName
				),
				body: convertNode(getNode(program, valueExp.body), program)
			});
		}
	}

	fnDefs.push({
		name: 'main',
		args: [],
		body: convertNode(root(program), program)
	});

	return fnDefs;
}

const convertNode = (node, prog) => {
	switch (getNodeOrExpType(node)) {
		case expressionType.NUMBER: return {
			tag: 'number',
			val: node.value
		};

		case expressionType.IDENTIFIER: return {
			tag: 'identifier',
			name: getIdentifier(prog, node.identifier).displayName
		};

		case expressionType.LAMBDA:
			throw 'AST V1 cannot represent lambda expressions';

		case expressionType.APPLICATION: return {
			tag: 'call',
			function: convertNode(getNode(prog, node.lambda), prog),
			argVals: node.arguments.map(argId =>
				convertNode(getNode(prog, argId), prog))
		};

		case expressionType.CASE: return {
			tag: 'case',
			cases: node.caseBranches.map(branchId =>
				convertNode(getNode(prog, branchId), prog)),
			elseExp: convertNode(getNode(prog, node.elseBranch), prog)
		};

		case nodeType.CASE_BRANCH: return {
			condition: convertNode(getNode(prog, node.condition), prog),
			exp: convertNode(getNode(prog, node.expression), prog)
		};

		case nodeType.ELSE_BRANCH:
			return convertNode(getNode(prog, node.expression), prog);

		default:
			throw `Unexpected node: ${getNodeOrExpType(node)}.`;
	}
};
