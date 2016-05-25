import React from 'react'
import name from '../lib/name'
import Radium from 'radium'
import colors from '../styles/colors'
import simpleToString from '../ast/simpleToString.js'

let handleSimple = e => {
	let simple = simpleToString(e);
	if (typeof simple === 'string') {
		return { isSimple: true, id: e.id, exp: e, string: simple };
	} else {
		return e;
	}
};

let makeSimple = (str, e) => ({
	isSimple: true, id: e.id, exp: e, string: str, isBlock: true
});

const ExpressionView = name('ExpressionView')(Radium(({
	expr, level, notFirst, selectedExpId, onExpClicked
}) => {
	let clicked = (e, expr) => {
		e.stopPropagation();
		onExpClicked(expr);
	};
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
		if (expr.infix) {
			pieces = [
				handleSimple(expr.argVals[0]),
				handleSimple(expr.function),
				handleSimple(expr.argVals[1])
			];
		} else {
			pieces.push(handleSimple(expr.function));
			for (let argVal of expr.argVals) {
				pieces.push(handleSimple(argVal));
			}
		}
	} else {
		pieces.push(handleSimple(expr));
	}

	let levelStyles = {
		fontFamily: 'Helvetica Neue, sans-serif',
		fontSize: 35,
		fontWeight: '200',

		// height: 45-level*4,
		// lineHeight: (45-level*4) + 'px',
		// borderRadius: 10 - level*2,
		height: level === 0 ? 'auto' : 70,
		lineHeight: '70px',
		borderRadius: level === 1 ? 4 : 0,

		marginLeft: notFirst ? 12 : 0,
		padding: level === 0 ? '12px 12px 0 12px' : '0 12px',
		marginBottom: 12,
		backgroundColor: selectedExpId === expr.id ? colors.selectedExp : level === 0 ? 'rgba(0,0,0,0)' : colors.exp,
		display: 'inline-block',
		cursor: 'pointer'
	};

	let exprMarkup = pieces.map((piece, i) => {
		let pieceStyles = {};

		if (!piece.isBlock && piece.id === selectedExpId) {
			pieceStyles.color = colors.selectedExp;
		}

		let simplePieceStyles = {
			marginLeft: i === 0 ? 5 : 10,
			marginRight: i === pieces.length-1 ? 5 : 0
		};

		if (piece.isSimple) {
			return (
				<span
					key={piece.id}
					style={[simplePieceStyles, pieceStyles]}
					onClick={(e) => clicked(e, piece.exp)}>
					{piece.string}
				</span>
			);
		}

		if (level >= 3) {
			return (
				<span
					key={piece.id}
					style={[simplePieceStyles, pieceStyles]}>
					{'...'}
				</span>
			);
		}

		return (
			<ExpressionView
				key={piece.id}
				expr={piece}
				level={level + 1}
				notFirst={i > 0}
				selectedExpId={selectedExpId}
				onExpClicked={onExpClicked}
				/>
		);
	});

	return (
		<div
			style={levelStyles}
			onClick={(e) => clicked(e, expr)}>
			{exprMarkup}
		</div>
	);
}));

export default ExpressionView;
