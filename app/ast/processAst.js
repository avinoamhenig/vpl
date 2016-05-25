import uuid from 'node-uuid'
import simpleToString from './simpleToString.js'

const infixFns = '+ - * div mod = != < > <= >='.split(' ');
let isInfixCall = e => {
	return e.argVals.length === 2
		&& infixFns.indexOf(simpleToString(e.function)) !== -1;
};

let processAst = (ast, isCaseExp = false) => {
	if (Array.isArray(ast)) {
		return ast.map((lambda) => processAst(lambda));
	}

	let id = uuid.v4();

	if (ast.body !== undefined) {
		return {
			syntaxTag: 'function_def', id,
			args: ast.args, name: ast.name,
			body: processAst(ast.body)
		};
	} if (isCaseExp) {
		if (ast.condition !== undefined) {
			return {
				syntaxTag: 'case_exp', id,
				condition: processAst(ast.condition),
				exp: processAst(ast.exp)
			};
		} else {
			return { syntaxTag: 'else_exp', id, exp: processAst(ast) };
		}
	} else if (ast.tag === 'call') {
		let infix = false;
		if (ast.tag === 'call' && isInfixCall(ast)) {
			infix = true;
		}
		return {
			syntaxTag: 'expression', id, infix,
			tag: ast.tag,
			function: processAst(ast.function),
			argVals: ast.argVals.map(arg => processAst(arg))
		};
	} else if (ast.tag === 'case') {
		return {
			syntaxTag: 'expression', id,
			tag: ast.tag,
			cases: ast.cases.map(ce => processAst(ce, true)),
			elseExp: processAst(ast.elseExp, true)
		};
	} else {
		return { syntaxTag: 'expression', id, ...ast };
	}
};

export default processAst;
