const uuid = require('node-uuid');
const { astType, nodeType, expressionType } = require('./typeNames');
const { rootNode } = require('./accessors');
const oa = Object.assign;

function createUid() {
	return uuid.v4();
}

function _createNode (nodeType, props) {
	return oa({
		astType: astType.NODE,
		nodeType,
		id: createUid(),
		parent: null,
		displayName: null,
		boundIdentifiers: []
	}, props);
}

function _createExpression (expressionType, props) {
	return _createNode(nodeType.EXPRESSION, oa({
		expressionType,
 		type: null // REVIEW type should probably never be null
	}, props));
}

function _setParent (node, parentId) {
	return oa({}, node, { parent: parentId });
}

function _createProgramFragment (rootNode, ...frags) {
	const nodes = oa({},
		...frags.map(frag => oa({}, frag.nodes, {
			[frag.rootNode]: _setParent(
				frag.nodes[frag.rootNode],
				rootNode.id
			)
		}))
	);
	nodes[rootNode.id] = rootNode;

	return {
		astType: astType.PROGRAM_FRAGMENT,
		rootNode: rootNode.id,
		nodes,
		identifiers: oa({}, ...frags.map(f => f.identifiers)),
		constructors: oa({}, ...frags.map(f => f.constructors)),
		typeDefinitions: oa({}, ...frags.map(f => f.typeDefinitions)),
		typeVariables: oa({}, ...frags.map(f => f.typeVariables))
	};
}

function _attachIdentifiersToFragment (programFragment, identifiers) {
	const fragCopy = oa({}, programFragment, {
		identifiers: oa({}, programFragment.identifiers)
	});
	for (const identifier of identifiers) {
		fragCopy.identifiers[identifier.id] = identifier;
	}
	return fragCopy;
}

// ProgramFragment... -> Program
// Note: things in later fragments can override earlier fragments.
// So put the basis first.
function createProgram (...frags) {
	const lastFrag = frags[frags.length - 1];

	return {
		astType: astType.PROGRAM,
		expression: lastFrag.rootNode,
		nodes: oa({}, ...frags.map(f => f.nodes)),
		identifiers: oa({}, ...frags.map(f => f.identifiers)),
		constructors: oa({}, ...frags.map(f => f.constructors)),
		typeDefinitions: oa({}, ...frags.map(f => f.typeDefinitions)),
		typeVariables: oa({}, ...frags.map(f => f.typeVariables))
	};
}

// String -> Identifier
function createIdentifier (name) {
	return {
		astType: astType.IDENTIFIER,
		id: createUid(),
		displayName: name,
		scope: null,
		value: null
	};
}

// Number -> ProgramFragment
function createNumberExpression (value = 0) {
	return _createProgramFragment(
		_createExpression(expressionType.NUMBER, { value })
	);
}

// Identifier -> ProgramFragment
function createIdentifierExpression (identifier) {
	return _createProgramFragment(
		_createExpression(expressionType.IDENTIFIER, {
			identifier: identifier.id
		})
	);
};

// [Identifier], ProgramFragment -> ProgramFragment
// This function copies all the Identifiers (preserving their uid's) and
// sets their scope to the LambdaExpression before attaching them to the
// resulting ProgramFragment.
function createLambdaExpression (argumentIdentifiers, bodyFragment) {
	const frag = _createProgramFragment(
		_createExpression(expressionType.LAMBDA, {
			arguments: argumentIdentifiers.map(argIdent => argIdent.id),
			body: bodyFragment.rootNode
		}),
		bodyFragment
	);
	const newArgIdents = [];
	for (const identifier of argumentIdentifiers) {
		newArgIdents.push(oa({}, identifier, {
			scope: frag.rootNode
		}));
	}
	return _attachIdentifiersToFragment(frag, newArgIdents);
};

// ProgramFragment, [ProgramFragment] -> ProgramFragment
function createApplicationExpression (lambdaFrag, argFrags) {
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

// String, [TypeInstance], Uid -> Constructor
function createConstructor (name, parameterTypes, typeDefId) {
	return {
		astType: astType.CONSTRUCTOR,
		id: createUid(),
		displayName: name,
		parameterTypes: parameterTypes.map(t => t.id),
		typeDefinition: typeDefId
	};
}

// String, [Constructor], [TypeVariable], Uid -> TypeDefinition
function createTypeDefinition (name, constructors, parameters, id) {
	return {
		astType: astType.TYPE_DEFINITION, id,
		displayName: name,
		constructors: constructors.map(c => c.id),
		parameters: parameters.map(p => p.id)
	};
}

// Constructor, [ProgramFragment], TypeDefinition? -> ProgramFragment
function createConstructionExpression (constructor, parameters) {
	return _createProgramFragment(
		_createExpression(expressionType.CONSTRUCTION, {
			constructor: constructor.id,
			parameters: parameters.map(p => p.rootNode),
		}),
		parameters
	);
}

// String -> ProgramFragment
function createBuiltInFunctionExpression(reference) {
	return _createProgramFragment(
		_createExpression(expressionType.BUILT_IN_FUNCTION, {
			reference
		})
	);
}

module.exports = {
	createProgram, createIdentifier, createNumberExpression,
	createIdentifierExpression, createLambdaExpression,
	createApplicationExpression, createCaseExpression, createCaseBranch,
	createConstructionExpression, createConstructor, createUid,
	createTypeDefinition, createBuiltInFunctionExpression
};
