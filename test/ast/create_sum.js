const {
	createProgram,
	createIdentifier,
	createNumberExpression,
	createIdentifierExpression,
	createLambdaExpression,
	createApplicationExpression,
	createCaseExpression,
	createCaseBranch,
	bindIdentifier
} = require('../../app/ast');

module.exports = () => {
	const plus = createIdentifier('+');
	const minus = createIdentifier('-');
	const eq = createIdentifier('=');
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
		bindIdentifier(rootExp, sumIdent, sumLambda)
	);
}
