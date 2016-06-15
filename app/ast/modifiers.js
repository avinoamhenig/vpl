import assert from 'assert';
import { rootNode } from './accessors';
import { astType, nodeType, expressionType } from './typeNames';

// Program | ProgramFragment, Identifier, ProgramFragment
export function bindIdentifier(program, identifier, valueExpFrag) {
	assert([astType.PROGRAM, astType.PROGRAM_FRAGMENT].includes(program.astType),
		`Cannot set binding on ${program.astType}.`);
	assert.strictEqual(identifier.astType, astType.IDENTIFIER);
	assert.strictEqual(valueExpFrag.astType, astType.PROGRAM_FRAGMENT);
	assert.strictEqual(rootNode(valueExpFrag).nodeType, nodeType.EXPRESSION);

	const newProgram = { ...program };
	const newIdentifier = {
		...identifier,
		value: rootNode(valueExpFrag).id
	};
	newProgram.identifiers = {
		...newProgram.identifiers,
		...valueExpFrag.identifiers,
		[identifier.id]: newIdentifier
	};
	newProgram.nodes = {
		...newProgram.nodes,
		...valueExpFrag.nodes,
		[rootNode(valueExpFrag).id]: rootNode(valueExpFrag)
	};
	return newProgram;
}
