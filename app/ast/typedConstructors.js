const {
	createIdentifier,
	createIdentifierExpression,
	createLambdaExpression,
	createDefaultExpression,
	createTypeVariable,
	createTypeInstance,
	_createProgramFragment,
	createCaseExpression,
	createCaseBranch,
	createConstructionExpression,
	_createElseBranch,
	createDoExpression
} = require('./constructors');
const {
	rootNode,
	getBasisEntity,
	getEntity
} = require('./accessors');
const {
	attachTypeDefinitions,
	setType,
	mergeFragments
} = require('./modifiers');

const tCreateDefaultExpression = () => {
	const tVar = createTypeVariable();
	const type = createTypeInstance(tVar.id);
	return attachTypeDefinitions(
		setType(createDefaultExpression(), type),
		[], [], [tVar]
	);
};

const tCreateIdentifier = (name) => {
	const frag = _createProgramFragment({});
	const ident = createIdentifier(name);
	frag.rootNode = ident.id;
	frag.identifiers[ident.id] = ident;
	const tVar = createTypeVariable();
	const type = createTypeInstance(tVar.id);
	return attachTypeDefinitions(
		setType(frag, ident.id, type),
		[], [], [tVar]
	);
};

const tCreateLambdaExpression = (program, argIdentFrag, bodyFrag) => {
	const	argType = argIdentFrag.types[argIdentFrag.rootNode];
	const retType = bodyFrag.types[bodyFrag.rootNode];
	const lambdaType = createTypeInstance(
		getBasisEntity(program, require('../basis').typeDefinitions.Lambda).id,
		[argType, retType]
	);
	const lambdaFrag = setType(
		createLambdaExpression([argIdentFrag.identifiers[argIdentFrag.rootNode]], bodyFrag),
		lambdaType
	);
	return mergeFragments(lambdaFrag.rootNode, lambdaFrag, argIdentFrag);
};

const tCreateCaseExpression = (caseFrags, elseFrag) => {
	const	type = elseFrag.types[elseFrag.rootNode];
	const frag = setType(createCaseExpression(caseFrags, elseFrag), type);
	return setType(
		frag,
		rootNode(frag).elseBranch,
		type
	);
};

const tCreateCaseBranch = (condFrag, expFrag) => {
	return setType(
		createCaseBranch(condFrag, expFrag),
		expFrag.types[expFrag.rootNode]
	);
};

const tCreateConstructionExpression = (constructor, paramFrags=[]) => {
	return setType(
		createConstructionExpression(constructor, paramFrags),
		createTypeInstance(
			constructor.typeDefinition,
			paramFrags.map(frag => frag.types[frag.rootNode])
		)
	);
};

const tCreateDoExpression = (unitFrags, returnFrag) => {
	const type = returnFrag.types[returnFrag.rootNode];
	return setType(
		createDoExpression(unitFrags, returnFrag),
		type
	);
};

module.exports = {
	tCreateIdentifier,
	tCreateDefaultExpression,
	tCreateLambdaExpression,
	tCreateCaseExpression,
	tCreateConstructionExpression,
	tCreateCaseBranch,
	tCreateDoExpression
};
