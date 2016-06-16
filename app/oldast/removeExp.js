import createExpression from './createExpression';

export default function removeExp(ast, expId) {
	if (ast.id === expId) {
		switch (ast.syntaxTag) {
			case 'expression': return createExpression();
			case 'case_exp': return createExpression('__--case_exp--__');
			default: throw `Can't remove ${ast.syntaxTag}.`;
		}
	}

	if (Array.isArray(ast)) {
		return ast.map(e => removeExp(e, expId));
	} else if (ast.syntaxTag === 'function_def') {
		if (ast.args.length > 1) {
			// TODO remove function_def argument
			// (maybe make args identifier expressions with id's?)
		}

		return {
			...ast,
			body: removeExp(ast.body, expId)
		};
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			let cases = ast.cases;
			if (ast.cases.length > 1) {
				cases = ast.cases.filter(e => e.id !== expId);
			}

			return {
				...ast,
				cases: cases.map(e => removeExp(e, expId)),
				elseExp: removeExp(ast.elseExp, expId)
			};
		} else if (ast.tag === 'call') {
			let argVals = ast.argVals;
			if (ast.argVals.length > 1) {
				argVals = ast.argVals.filter(e => e.id !== expId);
			}

			return {
				...ast,
				function: removeExp(ast.function, expId),
				argVals: argVals.map(e => removeExp(e, expId))
			};
		} else {
			return { ...ast };
		}
	} else if (ast.syntaxTag === 'case_exp') {
		return {
			...ast,
			condition: removeExp(ast.condition, expId),
			exp: removeExp(ast.exp, expId)
		};
	} else if (ast.syntaxTag === 'else_exp') {
		return {
			...ast,
			exp: removeExp(ast.exp, expId)
		};
	}

	throw new Error('Unkown AST type!');
};
