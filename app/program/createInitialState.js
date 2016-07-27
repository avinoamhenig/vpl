const {
	createDefaultExpression,
	createTypeVariable,
	createTypeInstance,
	setType,
	createProgram,
	rootNode,
	attachTypeDefinitions
} = require('ast');
const basis = require('basis');

export default () => {
	const frag = createDefaultExpression();
	const typeVar = createTypeVariable();
	return createProgram(
		basis.basisFragment,
		attachTypeDefinitions(
			setType(frag, createTypeInstance(typeVar.id)),
			[], [], [typeVar]
		)
	);
}
