const assert = require('assert');
const { rootNode } = require('./accessors');
const { astType, nodeType, expressionType } = require('./typeNames');

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
		valueExpFrag.nodes,
		{ [rootNode(valueExpFrag).id]: rootNode(valueExpFrag) }
	);
	return newProgram;
}

// Identifier, Uid Expression -> Identifier
function setIdentifierScope(identifier, scopeId = null) {
	assert.strictEqual(identifier.astType, astType.IDENTIFIER);

	return Object.assign({}, identifier, { scope: scopeId });
}

module.exports = { bindIdentifier, setIdentifierScope };
