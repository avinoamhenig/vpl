export default function replaceExpById(ast, exp, replaceId) {
	if (ast.id === replaceId) {
		if (ast.syntaxTag !== 'expression'
		|| exp.syntaxTag !== 'expression') {
			throw new Error(
				`Cannot replace ${ast.syntaxTag} with ${exp.syntaxTag}`
			);
		}
		return exp;
	}

	if (Array.isArray(ast)) {
		return ast.map(e => replaceExpById(e, exp, replaceId));
	} else if (ast.syntaxTag === 'function_def') {
		return {
			...ast,
			body: replaceExpById(ast.body, exp, replaceId)
		};
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			return {
				...ast,
				cases: ast.cases.map(e => replaceExpById(e, exp, replaceId)),
				elseExp: replaceExpById(ast.elseExp, exp, replaceId)
			};
		} else if (ast.tag === 'call') {
			return {
				...ast,
				function: replaceExpById(ast.function, exp, replaceId),
				argVals: ast.argVals.map(e => replaceExpById(e, exp, replaceId))
			};
		} else {
			return { ...ast };
		}
	} else if (ast.syntaxTag === 'case_exp') {
		return {
			...ast,
			condition: replaceExpById(ast.condition, exp, replaceId),
			exp: replaceExpById(ast.exp, exp, replaceId)
		};
	} else if (ast.syntaxTag === 'else_exp') {
		return {
			...ast,
			exp: replaceExpById(ast.exp, exp, replaceId)
		};
	}

	throw new Error('Unkown AST type!');
};
