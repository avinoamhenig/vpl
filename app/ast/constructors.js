const uuid = require('node-uuid');
const assert = require('assert');
const { astType, nodeType, expressionType } = require('./typeNames');
const { rootNode } = require('./accessors');

function _createNode (nodeType, props) {
	return Object.assign({
		astType: astType.NODE,
		nodeType,
		id: uuid.v4(),
		parent: null,
		displayName: null
	}, props);
}

function _createExpression (expressionType, props) {
	return _createNode(nodeType.EXPRESSION, Object.assign(
		{ expressionType }, props
	));
}

function _setParent (node, parentId) {
	return Object.assign({}, node, { parent: parentId });
}

function _createProgramFragment (rootNode, ...frags) {

	const nodes = Object.assign({},
		...frags.map(frag => Object.assign(frag.nodes, {
			[frag.rootNode]: _setParent(
				frag.nodes[frag.rootNode],
				rootNode.id
			)
		}))
	);
	const identifiers =  Object.assign({},
		...frags.map(frag => frag.identifiers));

	nodes[rootNode.id] = rootNode;

	return {
		astType: astType.PROGRAM_FRAGMENT,
		rootNode: rootNode.id,
		nodes, identifiers
	};
}

function _attachIdentifiersToFragment (programFragment, identifiers) {
	const fragCopy = Object.assign({}, programFragment);
	for (const identifier of identifiers) {
		fragCopy.identifiers[identifier.id] = identifier;
	}
	return fragCopy;
}

// ProgramFragment -> Program
function createProgram (programFragment) {
	assert.strictEqual(programFragment.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(programFragment).nodeType, nodeType.EXPRESSION);

	return {
		astType: astType.PROGRAM,
		expression: programFragment.rootNode,
		nodes: programFragment.nodes,
		identifiers: programFragment.identifiers
	};
}

// Maybe String, Maybe Uid Node, Maybe Uid Expression -> Identifier
function createIdentifier (name = null, scope = null, value = null) {
	return {
		astType: astType.IDENTIFIER,
		id: uuid.v4(),
		displayName: name,
		scope, value
	};
}

// Number -> ProgramFragment
function createNumberExpression (value = 0) {
	assert.strictEqual(typeof value, 'number');

	return _createProgramFragment(
		_createExpression(expressionType.NUMBER, { value })
	);
}

// Identifier -> ProgramFragment
function createIdentifierExpression (identifier) {
	assert.strictEqual(identifier.astType, astType.IDENTIFIER);

	return _attachIdentifiersToFragment(
		_createProgramFragment(_createExpression(expressionType.IDENTIFIER, {
			identifier: identifier.id
		})),
		[identifier]
	);
};

// [Identifier], ProgramFragment -> ProgramFragment
// This function copies all the Identifiers (preserving their uid's) and
// sets their scope to the LambdaExpression before attaching them to the
// resulting ProgramFragment.
function createLambdaExpression (argumentIdentifiers, bodyFragment) {
	for (const argIdent of argumentIdentifiers) {
		assert.strictEqual(argIdent.astType, astType.IDENTIFIER);
	}

	assert.strictEqual(bodyFragment.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(bodyFragment).nodeType, nodeType.EXPRESSION);

	const frag = _createProgramFragment(
		_createExpression(expressionType.LAMBDA, {
			arguments: argumentIdentifiers.map(argIdent => argIdent.id),
			body: bodyFragment.rootNode
		}),
		bodyFragment
	);
	const newArgIdents = [];
	for (const identifier of argumentIdentifiers) {
		newArgIdents.push(Object.assign({}, identifier, {
			scope: frag.rootNode
		}));
	}
	return _attachIdentifiersToFragment(frag, newArgIdents);
};

// ProgramFragment, [ProgramFragment] -> ProgramFragment
function createApplicationExpression (lambdaFrag, argFrags) {
	assert.strictEqual(lambdaFrag.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(lambdaFrag).nodeType, nodeType.EXPRESSION);
	for (const argFrag of argFrags) {
		assert.strictEqual(argFrag.astType, astType.PROGRAM_FRAGMENT);
		assert.strictEqual(rootNode(argFrag).nodeType, nodeType.EXPRESSION);
	}

	return _createProgramFragment(
		_createExpression(expressionType.APPLICATION, {
			lambda: lambdaFrag.rootNode,
			arguments: argFrags.map(argFrag => argFrag.rootNode)
		}),
		lambdaFrag, ...argFrags
	);
};

// [ProgramFragment], ProgramFragment -> ProgramFragment
function createCaseExpression (caseFrags, elseExpFrag) {
	assert(caseFrags.length > 0, 'CaseExpression must have 1 or more cases');
	for (const caseFrag of caseFrags) {
		assert.strictEqual(caseFrag.astType, astType.PROGRAM_FRAGMENT);
		assert.strictEqual(rootNode(caseFrag).nodeType, nodeType.CASE_BRANCH);
	}
	assert.strictEqual(elseExpFrag.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(elseExpFrag).nodeType, nodeType.EXPRESSION);

	const elseBranchFrag = _createElseBranch(elseExpFrag);
	return _createProgramFragment(
		_createExpression(expressionType.CASE, {
			caseBranches: caseFrags.map(caseFrag => caseFrag.rootNode),
			elseBranch: elseBranchFrag.rootNode
		}),
		elseBranchFrag, ...caseFrags
	);
};

// ProgramFragment, ProgramFragment -> ProgramFragment
function createCaseBranch (condFrag, expFrag) {
	assert.strictEqual(condFrag.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(condFrag).nodeType, nodeType.EXPRESSION);
	assert.strictEqual(expFrag.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(expFrag).nodeType, nodeType.EXPRESSION);

	return _createProgramFragment(
		_createNode(nodeType.CASE_BRANCH, {
			condition: condFrag.rootNode,
			expression: expFrag.rootNode
		}),
		condFrag, expFrag
	);
};

// ProgramFragment -> ProgramFragment
function _createElseBranch (expFrag) {
	return _createProgramFragment(
		_createNode(nodeType.ELSE_BRANCH, {
			expression: expFrag.rootNode
		}),
		expFrag
	);
};

module.exports = {
	createProgram, createIdentifier, createNumberExpression,
	createIdentifierExpression, createLambdaExpression,
	createApplicationExpression, createCaseExpression, createCaseBranch
};
