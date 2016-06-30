const {
	createIdentifier,
	createConstructor,
	createUid,
	createTypeDefinition,
	createNumberExpression,
	bindIdentifiers,
	createBuiltInFunctionExpression,
	attachTypeDefinitions
} = require('../../app/ast');
const r = require('./references');

// Identifiers
const i = {
	[r.PLUS]: createIdentifier('+'),
	[r.MINUS]: createIdentifier('-'),
	[r.EQUAL]: createIdentifier('=')
};
module.exports.identifiers = i;

// TypeDefinition Uids
const tIds = {
	bool: createUid()
};

// Constructors
const c = {
	True: createConstructor('True', [], tIds.bool),
	False: createConstructor('False', [], tIds.bool)
};
module.exports.constructors = c;

// TypeDefinitions
const t = {
	Bool: createTypeDefinition('Boolean', [c.True, c.False], [], tIds.bool)
};
module.exports.typeDefinitions = t;

// Create fragment and bind identifiers and attach types.
module.exports.basisFragment = attachTypeDefinitions(
	bindIdentifiers(createNumberExpression(0), Object.keys(i)
		.map(ref => [i[ref], createBuiltInFunctionExpression(ref)])),
	Object.keys(t).map(k => t[k]),
	Object.keys(c).map(k => c[k]),
	[] // TODO type variables
);
