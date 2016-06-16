export default function unProcessAst(ast) {
	if (Array.isArray(ast)) {
		return ast.map(e => unProcessAst(e));
	} else if (ast.syntaxTag === 'function_def') {
		return {
			...ast,
			body: unProcessAst(ast.body)
		};
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			return {
				...ast,
				cases: ast.cases.map(e => unProcessAst(e)),
				elseExp: unProcessAst(ast.elseExp)
			};
		} else if (ast.tag === 'call') {
			return {
				...ast,
				function: unProcessAst(ast.function),
				argVals: ast.argVals.map(e => unProcessAst(e))
			};
		} else {
			return { ...ast };
		}
	} else if (ast.syntaxTag === 'case_exp') {
		return {
			...ast,
			condition: unProcessAst(ast.condition),
			exp: unProcessAst(ast.exp)
		};
	} else if (ast.syntaxTag === 'else_exp') {
		return unProcessAst(ast.exp);
	}

	throw new Error('Unkown AST type!');
};
