const {
	createIdentifier,
	createConstructor,
	createTypeVariable,
	createTypeInstance,
	createNumberExpression,
	bindIdentifiers,
	createBuiltInFunctionExpression,
	attachTypeDefinitions,
	setTypes
} = require('../../app/ast');
const r = require('./references');
const {
	typeDefinitions,
	constructors,
	typeVariables,
	newTypeDefinition
} = require('./typeDefinitionFactory')();

newTypeDefinition('Number', uid => {
	return {
		parameters: [],
		constructors: []
	};
});

newTypeDefinition('Bool', uid => {
	return {
		parameters: [],
		constructors: [
			createConstructor('True', [], uid),
			createConstructor('False', [], uid)
		]
	};
});

newTypeDefinition('Lambda', uid => {
	return {
		parameters: [],
		constructors: []
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

newTypeDefinition('Range', uid => {
	return {
		parameters: [],
		constructors: [
			createConstructor('Range', [
				createTypeInstance(typeDefinitions.Number.id),
				createTypeInstance(typeDefinitions.Number.id),
				createTypeInstance(typeDefinitions.Number.id)
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

	[r.FOLD]: createIdentifier('fold'),
	[r.FOLD_RANGE]: createIdentifier('fold-range'),

	[r.MOVE]: createIdentifier('move'),
	[r.DRAW]: createIdentifier('draw'),
	[r.TURN]: createIdentifier('turn')
};

const nullTVar = createTypeVariable();
typeVariables[nullTVar.id] = nullTVar;
const foldTVarA = createTypeVariable();
typeVariables[foldTVarA.id] = foldTVarA;
const foldTVarB = createTypeVariable();
typeVariables[foldTVarB.id] = foldTVarB;
const foldrTVar = createTypeVariable();
typeVariables[foldrTVar.id] = foldrTVar;

module.exports.identifiers = i;
module.exports.typeDefinitions = typeDefinitions;
module.exports.constructors = constructors;
module.exports.typeVariables = typeVariables;

// Create fragment and bind identifiers and attach types.
let basisFragment = attachTypeDefinitions(
	bindIdentifiers(createNumberExpression(0), Object.keys(i)
		.map(ref => [i[ref], createBuiltInFunctionExpression(ref)])),
	Object.keys(typeDefinitions).map(k => typeDefinitions[k]),
	Object.keys(constructors).map(k => constructors[k]),
	Object.keys(typeVariables).map(k => typeVariables[k])
);

// set built in function types
const ct = createTypeInstance;
const binNumT = ct(typeDefinitions.Lambda.id, [
	ct(typeDefinitions.Number.id),
	ct(typeDefinitions.Number.id),
	ct(typeDefinitions.Number.id)
]);
const cmpT = ct(typeDefinitions.Lambda.id, [
	ct(typeDefinitions.Number.id),
	ct(typeDefinitions.Number.id),
	ct(typeDefinitions.Bool.id)
]);
const drawT = ct(typeDefinitions.Lambda.id, [
	ct(typeDefinitions.Number.id),
	ct(typeDefinitions.Number.id)
]);
basisFragment = setTypes(basisFragment,[
	[i[r.PLUS].id,      binNumT],
	[i[r.MINUS].id,     binNumT],
	[i[r.TIMES].id,     binNumT],
	[i[r.DIVIDE].id,    binNumT],
	[i[r.REMAINDER].id, binNumT],

	[i[r.EQUAL].id,         cmpT],
	[i[r.NOT_EQUAL].id,     cmpT],
	[i[r.LESS_THAN].id,     cmpT],
	[i[r.GREATER_THAN].id,  cmpT],
	[i[r.LESS_EQUAL].id,    cmpT],
	[i[r.GREATER_EQUAL].id, cmpT],

	[i[r.NULL].id, ct(typeDefinitions.Lambda.id, [
		ct(typeDefinitions.List.id, [ct(nullTVar.id)]),
		ct(typeDefinitions.Bool.id)
	])],

	[i[r.RANDOM].id, ct(typeDefinitions.Lambda.id, [
		ct(typeDefinitions.Number.id)
	])],

	[i[r.FOLD].id, ct(typeDefinitions.Lambda.id, [
		ct(typeDefinitions.Lambda.id, [
			ct(foldTVarB.id), ct(foldTVarA.id), ct(foldTVarB.id)
		]),
		ct(foldTVarB.id),
		ct(typeDefinitions.List.id, [ ct(foldTVarA.id) ]),
		ct(foldTVarB.id)
	])],
	[i[r.FOLD_RANGE].id, ct(typeDefinitions.Lambda.id, [
		ct(typeDefinitions.Lambda.id, [
			ct(foldrTVar.id), ct(typeDefinitions.Number.id), ct(foldrTVar.id)
		]),
		ct(foldrTVar.id),
		ct(typeDefinitions.Range.id),
		ct(foldrTVar.id)
	])],

	[i[r.MOVE].id, drawT],
	[i[r.DRAW].id, drawT],
	[i[r.TURN].id, drawT]
]);

module.exports.basisFragment = basisFragment;
