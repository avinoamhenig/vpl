const {
	createProgram,
	createIdentifier,
	createNumberExpression,
	createIdentifierExpression,
	createLambdaExpression,
	createApplicationExpression,
	createCaseExpression,
	createCaseBranch,
	bindIdentifiers
} = require('../../app/ast');
const basis = require('../../app/basis');

module.exports = () => {
	const plus = basis.identifiers[basis.references.PLUS];
	const minus = basis.identifiers[basis.references.MINUS];
	const eq = basis.identifiers[basis.references.EQUAL];
	const n = createIdentifier('n');
	const sumIdent = createIdentifier('sum');
	const sumLambda = createLambdaExpression([n],
		createCaseExpression(
			[createCaseBranch(
				createApplicationExpression(
					createIdentifierExpression(eq), [
					createIdentifierExpression(n),
					createNumberExpression(0)
				]),
				createNumberExpression(0)
			)],
			createApplicationExpression(
				createIdentifierExpression(plus), [
				createIdentifierExpression(n),
				createApplicationExpression(
					createIdentifierExpression(sumIdent), [
					createApplicationExpression(
						createIdentifierExpression(minus), [
						createIdentifierExpression(n),
						createNumberExpression(1)
					])
				])
			])
		)
	);
	const rootExp = createNumberExpression(0);
	return createProgram(
		basis.basisFragment,
		bindIdentifiers(rootExp, [[sumIdent, sumLambda]])
	);
}
