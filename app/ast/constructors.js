import uuid from 'node-uuid';
import { astType, nodeType, expressionType } from './typeNames'

function _assertEq (actual, expected, msg) {
	msg = msg || `Expected ${expected}, found ${actual}.`;
	if (actual !== expected) {
		throw msg;
	}
}

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

function _createProgramFragment (rootNode, ...frags) {
	const nodes = Object.assign({}, ...frags.map(frag => frag.nodes));
	const identifiers =  Object.assign({}, ...frags.map(frag => frag.identifiers));

	return {
		astType: astType.PROGRAM_FRAGMENT,
		rootNode: rootNode,
		nodes, identifiers
	};
}

export function attachIdentifiersToFragment (programFragment, identifiers) {
	const fragCopy = Object.assign({}, programFragment);
	for (const identifier of identifiers) {
		fragCopy[identifier.id] = identifier;
	}
	return fragCopy;
}

// ProgramFragment -> Program
export function createProgram (programFragment) {
	_assertEq(programFragment.astType, astType.PROGRAM_FRAGMENT);

	const rootNode = programFragment.nodes[programFragment.rootNode];
	_assertEq(rootNode.nodeType, nodeType.EXPRESSION,
		`Cannot create a program with root of type ${rootNode.nodeType }`);

	return {
		astType: astType.PROGRAM,
		expression: programFragment.rootNode,
		nodes: programFragment.nodes,
		identifiers: programFragment.identifiers
	};
}

// Maybe String, Maybe Uid Node, Maybe Uid Expression -> Identifier
export function createIdentifier (
		displayName = null,
		scope = null,
		value = null
	) {
	return {
		astType: astType.IDENTIFIER,
		id: uuid.v4(),
		displayName, scope, value
	};
}

// Number -> ProgramFragment
export function createNumberExpression (value = 0) {
	_assertEq(typeof value, 'number');

	return _createProgramFragment(
		_createExpression(expressionType.NUMBER, { value })
	);
}

// Identifier -> ProgramFragment
export function createIdentifierExpression (identifier) {
	_assertEq(identifier.astType, astType.IDENTIFIER);

	return attachIdentifiersToFragment(
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
export function createLambdaExpression(argumentIdentifiers, bodyFragment) {
	for (argIdent of argumentIdentifiers) {
		_assertEq(argIdent.astType, astType.IDENTIFIER);
	}

	_assertEq(bodyFragment.astType, astType.PROGRAM_FRAGMENT);
	_assertEq(bodyFragment.rootNode.nodeType, nodeType.EXPRESSION);

	const frag = _createProgramFragment(
		_createExpression(expressionType.LAMBDA, {
			arguments: argumentIdentifiers.map(argIdent => argIdent.id),
			body: bodyFragment.rootNode
		}),
		bodyFragment
	);
	const newArgIdents = [];
	for (const identifier of argumentIdentifiers) {
		newArgIdents.push(
			Object.assign({}, identifier, { scope: frag.rootNode.id })
		);
	}
	return attachIdentifiersToFragment(frag, newArgIdents);
};

// ProgramFragment, [ProgramFragment] -> ProgramFragment
export function createApplicationExpression(lambdaFrag, argFrags) {
	_assertEq(lambdaFrag.astType, astType.PROGRAM_FRAGMENT);
	_assertEq(lambdaFrag.rootNode.nodeType, nodeType.EXPRESSION);
	for (argFrag of argFrags) {
		_assertEq(argFrag.astType, astType.PROGRAM_FRAGMENT);
		_assertEq(argFrag.rootNode.nodeType, nodeType.EXPRESSION);
	}

	return _createProgramFragment(
		_createExpression(expressionType.APPLICATION, {
			lambda: lambdaFrag.rootNode.id,
			arguments: argFrags.map(argFrag => argFrag.rootNode.id)
		}),
		lambdaFrag, ...argFrags
	);
};

// [ProgramFragment], ProgramFragment -> ProgramFragment
export function createCaseExpression(caseFrags, elseExpFrag) {
	for (caseFrag of caseFrags) {
		_assertEq(caseFrag.astType, astType.PROGRAM_FRAGMENT);
		_assertEq(caseFrag.rootNode.nodeType, nodeType.CASE_BRANCH);
	}
	_assertEq(elseExpFrag.astType, astType.PROGRAM_FRAGMENT);
	_assertEq(elseExpFrag.rootNode.nodeType, nodeType.EXPRESSION);

	const elseBranchFrag = _createElseBranch(elseExpFrag);
	return _createProgramFragment(
		_createExpression(expressionType.CASE, {
			caseBrances: caseFrags.map(caseFrag => caseFrag.rootNode.id),
			elseBranch: elseBranchFrag.rootNode.id
		}),
		elseBranchFrag, ...caseFrags
	);
};

// ProgramFragment, ProgramFragment -> ProgramFragment
export function createCaseBranch(condFrag, expFrag) {
	_assertEq(condFrag.astType, astType.PROGRAM_FRAGMENT);
	_assertEq(condFrag.rootNode.nodeType, nodeType.EXPRESSION);
	_assertEq(expFrag.astType, astType.PROGRAM_FRAGMENT);
	_assertEq(expFrag.rootNode.nodeType, nodeType.EXPRESSION);

	return _createProgramFragment(
		_createNode(nodeType.CASE_BRANCH, {
			condition: condFrag.rootNode.id,
			expression: expFrag.rootNode.id
		}),
		condFrag, expFrag
	);
};

// ProgramFragment -> ProgramFragment
function _createElseBranch(expFrag) {
	return _createProgramFragment(
		_createNode(nodeType.CASE_BRANCH, {
			expression: expFrag.rootNode.id
		}),
		expFrag
	);
};
