const {
	createIdentifier,
	createConstructor,
	createTypeVariable,
	createTypeInstance,
	createNumberExpression,
	bindIdentifiers,
	createBuiltInFunctionExpression,
	attachTypeDefinitions
} = require('../../app/ast');
const r = require('./references');
const {
	typeDefinitions,
	constructors,
	typeVariables,
	newTypeDefinition
} = require('./typeDefinitionFactory')();

newTypeDefinition('Bool', uid => {
	return {
		parameters: [],
		constructors: [
			createConstructor('True', [], uid),
			createConstructor('False', [], uid)
		]
	};
});

newTypeDefinition('List', uid => {
	const elType = createTypeVariable();
	return {
		parameters: [elType],
		constructors: [
			createConstructor('End', [], uid),
			createConstructor('List', [
				createTypeInstance(elType.id),
				createTypeInstance(uid, [createTypeInstance(elType.id)])
			], uid)
		]
	};
});

newTypeDefinition('Pair', uid => {
	const a = createTypeVariable();
	const b = createTypeVariable();
	return {
		parameters: [a, b],
		constructors: [
			createConstructor('Pair', [
				createTypeInstance(a.id),
				createTypeInstance(b.id)
			], uid)
		]
	};
});

const i = {
	[r.PLUS]: createIdentifier('+'),
	[r.MINUS]: createIdentifier('-'),
	[r.TIMES]: createIdentifier('*'),
	[r.DIVIDE]: createIdentifier('/'),
	[r.REMAINDER]: createIdentifier('remainder'),

	[r.EQUAL]: createIdentifier('='),
	[r.NOT_EQUAL]: createIdentifier('!='),
	[r.LESS_THAN]: createIdentifier('<'),
	[r.GREATER_THAN]: createIdentifier('>'),
	[r.LESS_EQUAL]: createIdentifier('<='),
	[r.GREATER_EQUAL]: createIdentifier('>='),

  [r.NULL]: createIdentifier('null?'),

	[r.RANDOM]: createIdentifier('random'),

	[r.MOVE]: createIdentifier('move'),
	[r.DRAW]: createIdentifier('draw'),
	[r.TURN]: createIdentifier('turn')
};

module.exports.identifiers = i;
module.exports.typeDefinitions = typeDefinitions;
module.exports.constructors = constructors;
module.exports.typeVariables = typeVariables;

// Create fragment and bind identifiers and attach types.
module.exports.basisFragment = attachTypeDefinitions(
	bindIdentifiers(createNumberExpression(0), Object.keys(i)
		.map(ref => [i[ref], createBuiltInFunctionExpression(ref)])),
	Object.keys(typeDefinitions).map(k => typeDefinitions[k]),
	Object.keys(constructors).map(k => constructors[k]),
	Object.keys(typeVariables).map(k => typeVariables[k])
);
