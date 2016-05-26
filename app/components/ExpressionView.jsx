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
	expr, level, notFirst, selectedExpId, onExpClicked, nestingLimit
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
		height: level === 1 ? 'auto' : 70,
		lineHeight: '70px',
		borderRadius: level === 2 ? 3 : 0,
		marginLeft: notFirst ? 12 : 0,
		padding: level === 1 ? '12px 12px 0 12px' : '0 7px',
		marginBottom: 12,
		backgroundColor: selectedExpId === expr.id
			? colors.selectedExp : level === 1 ? 'rgba(0,0,0,0)'
			: colors.exp,
		display: 'inline-block',
		cursor: 'pointer'
	};

	let exprMarkup = pieces.map((piece, i) => {
		let pieceStyles = {
			paddingLeft: i === 0 ? 3 : 10,
			color: !piece.isBlock && piece.id === selectedExpId ?
				colors.selectedExp : '#000'
		};

		if (piece.isSimple) {
			return (
				<span
					key={piece.id}
					style={[pieceStyles]}
					onClick={(e) => clicked(e, piece.exp)}>
					{piece.string}
				</span>
			);
		}

		if (level >= nestingLimit) {
			return (
				<span
					key={piece.id}
					style={[pieceStyles]}>
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
				nestingLimit={nestingLimit}
				/>
		);
	});

	return (
		<div
			style={levelStyles}
			onClick={(e) => clicked(e, expr)}>
			{ level > nestingLimit ? '...' : exprMarkup }
		</div>
	);
}));

export default ExpressionView;
