// TODO cache ast derived data?

const getAstDepth = ast => {
	if (Array.isArray(ast)) {
		return ast.map(getAstDepth).reduce(Math.max);
	} else if (ast.syntaxTag === 'function_def') {
		return getAstDepth(ast.body);
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			return 1 + Math.max(
				getAstDepth(ast.elseExp),
				ast.cases.map(getAstDepth).reduce((a,b) => a+b));
		} else if (ast.tag === 'call') {
			return 1 + ast.argVals.map(getAstDepth).reduce((a,b) => a+b);
		} else {
			return 0;
		}
	} else if (ast.syntaxTag === 'case_exp') {
		return 1 + getAstDepth(ast.condition) + getAstDepth(ast.exp);
	} else if (ast.syntaxTag === 'else_exp') {
		return 1 + getAstDepth(ast.exp);
	}
};

export default getAstDepth;
