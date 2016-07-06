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

const i = {
	[r.PLUS]: createIdentifier('+'),
	[r.MINUS]: createIdentifier('-'),
	[r.EQUAL]: createIdentifier('='),
	[r.TIMES]: createIdentifier('*'),
	[r.DIVIDE]: createIdentifier('/'),
	[r.REMAINDER]: createIdentifier('remainder'),
	[r.NULL]: createIdentifier('null?'),
	[r.LESSTHAN]: createIdentifier('<'),
	

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
