import React from 'react'
import name from '../lib/name'
import Radium from 'radium'
import colors from '../styles/colors'

const ExpressionView = name('ExpressionView')(Radium(({
	expr, level, isCaseExp, notFirst
}) => {
	let pieces = [],
	    simpleToString = (e) => {
				if (e.tag === 'identifier') {
					return e.name;
				} else if (e.tag === 'number') {
					return '' + e.val;
				} else {
					return e;
				}
			};

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
		pieces.push(simpleToString(expr.function));
		for (let argVal of expr.argVals) {
			pieces.push(simpleToString(argVal));
		}
	} else {
		pieces.push(simpleToString(expr));
	}

	let levelStyles = {
		fontFamily: 'sans-serif',
		fontSize: '20px',
		height: 45-level*4,
		lineHeight: (45-level*4) + 'px',
		marginBottom: 10,
		backgroundColor: colors.epxrLevels[level],
		display: 'inline-block',
		borderRadius: 10 - level*2,
		padding: '0 4px',
		marginLeft: notFirst ? 10 : 0
	};

	let exprMarkup = pieces.map((piece, i) => {
		let textPieceStyles = {
			marginLeft: i === 0 ? 0 : 10
		};

		if (typeof piece === 'string') {
			return (<span style={[textPieceStyles]}>{piece}</span>);
		}

		if (level >= 3) {
			return (<span style={[textPieceStyles]}>{'...'}</span>);
		}

		return (
			<ExpressionView
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
