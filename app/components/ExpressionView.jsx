import React from 'react'
import name from '../lib/name'
import Radium from 'radium'
import colors from '../styles/colors'

let simpleToString = e => {
	if (e.tag === 'identifier') {
		return e.name;
	} else if (e.tag === 'number') {
		return '' + e.val;
	} else {
		return e;
	}
};

const infixFns = '+ - * div mod = != < > <= >='.split(' ');
let isInfixCall = e => {
	return e.argVals.length === 2
		&& infixFns.indexOf(simpleToString(e.function)) !== -1;
};

const ExpressionView = name('ExpressionView')(Radium(({
	expr, level, isCaseExp, notFirst
}) => {
	let pieces = [];

	if (isCaseExp && expr.condition !== undefined) {
		pieces.push(expr.condition);
		pieces.push(simpleToString(expr.exp));
	} else if (isCaseExp) {
		pieces.push('else');
		pieces.push(simpleToString(expr));
	} else if (expr.tag === 'case') {
		pieces.push('?');
		for (let caseExp of expr.cases) {
			pieces.push(caseExp);
		}
		pieces.push(expr.elseExp);
	} else if (expr.tag === 'call') {
		if (isInfixCall(expr)) {
			pieces = [
				simpleToString(expr.argVals[0]),
				simpleToString(expr.function),
				simpleToString(expr.argVals[1])
			];
		} else {
			pieces.push(simpleToString(expr.function));
			for (let argVal of expr.argVals) {
				pieces.push(simpleToString(argVal));
			}
		}
	} else {
		pieces.push(simpleToString(expr));
	}

	let levelStyles = {
		fontFamily: 'sans-serif',
		fontSize: '20px',

		// height: 45-level*4,
		// lineHeight: (45-level*4) + 'px',
		// borderRadius: 10 - level*2,
		height: 40,
		lineHeight: '40px',
		borderRadius: level === 1 ? 4 : 0,

		marginLeft: notFirst ? 10 : 0,
		padding: level === 0 ? '0 12px' : '0 5px',
		marginBottom: 10,
		backgroundColor: colors.epxrLevels[level],
		display: 'inline-block',
	};

	let exprMarkup = pieces.map((piece, i) => {
		let textPieceStyles = {
			marginLeft: i === 0 ? 5 : 10,
			marginRight: i === pieces.length-1 ? 5 : 0
		};

		if (typeof piece === 'string') {
			return (
				<span key={i} style={[textPieceStyles]}>{piece}</span>
			);
		}

		if (level >= 3) {
			return (
				<span key={i} style={[textPieceStyles]}>{'...'}</span>
			);
		}

		return (
			<ExpressionView
				key={i}
				expr={piece}
				level={level + 1}
				isCaseExp={expr.tag === 'case'}
				notFirst={i > 0}
				/>
		);
	});

	return (<div style={levelStyles}>{exprMarkup}</div>);
}));

export default ExpressionView;
