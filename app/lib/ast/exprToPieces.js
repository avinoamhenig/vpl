import simpleToString from './simpleToString.js'

const handleSimple = (e, isFn=false) => {
	let simple = simpleToString(e);
	if (typeof simple === 'string') {
		return {
			isSimple: true,
			id: e.id,
			exp: e,
			string: simple,
			isFn
		};
	} else {
		return e;
	}
};

const makeSimple = (str, e) => ({
	isSimple: true, id: e.id, exp: e, string: str, isBlock: true
});

export default function exprToPieces(expr, ignoreInfix = false) {
	let pieces = [];
	if (expr.syntaxTag === 'case_exp') {
		pieces.push(expr.condition);
		pieces.push(handleSimple(expr.exp));
	} else if (expr.syntaxTag === 'else_exp') {
		pieces.push(makeSimple('else', expr));
		pieces.push(handleSimple(expr.exp));
	} else if (expr.tag === 'case') {
		pieces.push(makeSimple('?', expr));
		for (let caseExp of expr.cases) {
			pieces.push(caseExp);
		}
		pieces.push(expr.elseExp);
	} else if (expr.tag === 'call') {
		if (!ignoreInfix && expr.infix) {
			pieces = [
				handleSimple(expr.argVals[0]),
				handleSimple(expr.function, true),
				handleSimple(expr.argVals[1])
			];
		} else {
			pieces.push(handleSimple(expr.function, true));
			for (let argVal of expr.argVals) {
				pieces.push(handleSimple(argVal));
			}
		}
	} else {
		pieces.push(handleSimple(expr));
	}
	return pieces;
};
