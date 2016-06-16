export default function getExpForId(id, ast) {
	if (ast.id === id) {
		return ast;
	}

	let toCheck = [];

	if (Array.isArray(ast)) {
		toCheck = ast;
	} else if (ast.syntaxTag === 'function_def') {
		toCheck = [ast.body];
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			toCheck = [ast.elseExp, ...ast.cases];
		} else if (ast.tag === 'call') {
			toCheck = [ast.function, ...ast.argVals];
		}
	} else if (ast.syntaxTag === 'case_exp') {
		toCheck = [ast.condition, ast.exp];
	} else if (ast.syntaxTag === 'else_exp') {
		toCheck = [ast.exp];
	}

	for (let e of toCheck) {
		const r = getExpForId(id, e);
		if (r) { return r; }
	}
	return false;
};
