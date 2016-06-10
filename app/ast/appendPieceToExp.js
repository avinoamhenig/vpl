import createExpression from './createExpression';

export default function appendPieceToExp(ast, expId) {
	if (ast.id === expId) {
		if (ast.syntaxTag === 'expression') {
			if (ast.tag === 'case') {
				return {
					...ast,
					cases: [
						...ast.cases,
						createExpression('__--case_exp--__')
					]
				};
			} else if (ast.tag === 'call') {
				return {
					...ast,
					argVals: [ ...ast.argVals, createExpression() ]
				};
			} else {
				throw `Can't append piece to ${ast.tag} expression`;
			}
		} else if (ast.syntaxTag === 'function_def') {
			return {
				...ast,
				args: [...ast.args, 'arg' + (ast.args.length + 1)]
			};
		} else {
			throw `Can't append piece to ${ast.syntaxTag}.`;
		}
	}

	if (Array.isArray(ast)) {
		return ast.map(e => appendPieceToExp(e, expId));
	} else if (ast.syntaxTag === 'function_def') {
		return {
			...ast,
			body: appendPieceToExp(ast.body, expId)
		};
	} else if (ast.syntaxTag === 'expression') {
		if (ast.tag === 'case') {
			return {
				...ast,
				cases: ast.cases.map(e => appendPieceToExp(e, expId)),
				elseExp: appendPieceToExp(ast.elseExp, expId)
			};
		} else if (ast.tag === 'call') {
			return {
				...ast,
				function: appendPieceToExp(ast.function, expId),
				argVals: ast.argVals.map(e => appendPieceToExp(e, expId))
			};
		} else {
			return { ...ast };
		}
	} else if (ast.syntaxTag === 'case_exp') {
		return {
			...ast,
			condition: appendPieceToExp(ast.condition, expId),
			exp: appendPieceToExp(ast.exp, expId)
		};
	} else if (ast.syntaxTag === 'else_exp') {
		return {
			...ast,
			exp: appendPieceToExp(ast.exp, expId)
		};
	}

	throw new Error('Unkown AST type!');
};
