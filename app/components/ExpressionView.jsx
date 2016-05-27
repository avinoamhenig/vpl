import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import colors from 'styles/colors'
import exprToPieces from 'lib/ast/exprToPieces'
import { compose } from 'redux'

const ExpressionView = compose(
	name('ExpressionView'), Radium
)(({
	expr, level, notFirst, selectedExpId, onExpClicked, nestingLimit
}) => {
	const
		expClicked = function (e, expr) {
			e.stopPropagation();
			onExpClicked(expr);
		},
		pieces = exprToPieces(expr),
		levelStyles = {
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
		},
		exprMarkup = pieces.map((piece, i) => {
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
						onClick={(e) => expClicked(e, piece.exp)}>
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
			onClick={(e) => expClicked(e, expr)}>
			{ level > nestingLimit ? '...' : exprMarkup }
		</div>
	);
});

export default ExpressionView;
