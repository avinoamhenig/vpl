export default function getExpForId(id, ast) {
	if (ast.id === id) {
		return ast;
	}

	if (Array.isArray(ast)) {
		return ast.map(e => getExpForId(id,e)).filter(ast => ast !== false)[0];
	} else if (ast.syntaxTag === 'function_def') {
		return getExpForId(id, ast.body);
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			return getExpForId(id, ast.elseExp) ||
				ast.cases.map(e => getExpForId(id, e)).filter(
					ast => ast !== false)[0];
		} else if (ast.tag === 'call') {
			return getExpForId(ast.function) ||
				ast.argVals.map(e => getExpForId(id, e)).filter(
					ast => ast !== false)[0];
		} else {
			return false;
		}
	} else if (ast.syntaxTag === 'case_exp') {
		return getExpForId(id, ast.condition) || getExpForId(id, ast.exp);
	} else if (ast.syntaxTag === 'else_exp') {
		return getExpForId(id, ast.exp);
	}
};
