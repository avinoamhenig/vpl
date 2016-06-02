import uuid from 'node-uuid'
import simpleToString from './simpleToString.js'

const infixFns = '+ - * div mod = != < > <= >='.split(' ');
let isInfixCall = e => {
	return e.argVals.length === 2
		&& infixFns.indexOf(simpleToString(e.function)) !== -1;
};

let processAst = (json, isCaseExp = false) => {
	if (Array.isArray(json)) {
		return json.map((lambda) => processAst(lambda));
	}

	let id = uuid.v4();

	if (json.body !== undefined) {
		var name = typeof json.name === 'object' ?
			json.name.name : json.name;
		return {
			syntaxTag: 'function_def', id,
			args: json.args, name,
			body: processAst(json.body)
		};
	} if (isCaseExp) {
		if (json.condition !== undefined) {
			return {
				syntaxTag: 'case_exp', id,
				condition: processAst(json.condition),
				exp: processAst(json.exp)
			};
		} else {
			return { syntaxTag: 'else_exp', id, exp: processAst(json) };
		}
	} else if (json.tag === 'call') {
		let infix = false;
		if (json.tag === 'call' && isInfixCall(json)) {
			infix = true;
		}
		return {
			syntaxTag: 'expression', id, infix,
			tag: json.tag,
			function: processAst(json.function),
			argVals: json.argVals.map(arg => processAst(arg))
		};
	} else if (json.tag === 'case') {
		return {
			syntaxTag: 'expression', id,
			tag: json.tag,
			cases: json.cases.map(ce => processAst(ce, true)),
			elseExp: processAst(json.elseExp, true)
		};
	} else {
		return { syntaxTag: 'expression', id, ...json };
	}
};

export default processAst;
