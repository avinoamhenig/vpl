import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import colors from 'styles/colors'
import exprToPieces from 'lib/ast/exprToPieces'
import { compose } from 'redux'

const ExpressionView = compose(
	name('ExpressionView'), Radium
)(({
	expr, level, expansionLevel,
	notFirst, selectedExpId,
	nestingLimit, expandedExpIds,
	onExpClicked, onCollapsedExpClicked
}) => {
	let
		expClicked = function (e, expr) {
			e.stopPropagation();
			onExpClicked(expr, expansionLevel);
		},
		collapsedExpClicked = function (e, expr) {
			e.stopPropagation();
			onCollapsedExpClicked(expr, expansionLevel);
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
		expandedLevelStyles = {
			position: 'absolute',
			width: '100%',
			left: 0,
			top: 165,
			backgroundColor: colors.exp
		},
		expandedMarkup = null,
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
				if (piece.id === expandedExpIds[expansionLevel]) {
					expandedMarkup = (
						<ExpressionView
							key={`expand_${piece.id}`}
							expr={piece}
							level={1}
							expansionLevel={expansionLevel + 1}
							selectedExpId={selectedExpId}
							nestingLimit={nestingLimit}
							expandedExpIds={expandedExpIds}
							onExpClicked={onExpClicked}
							onCollapsedExpClicked={onCollapsedExpClicked}
							/>
					);
				}
				return (
					<span
						key={piece.id}
						style={[pieceStyles]}
						onClick={(e) => collapsedExpClicked(e, piece)}>
						{'...'}
					</span>
				);
			}

			return (
				<ExpressionView
					key={piece.id}
					expr={piece}
					level={level + 1}
					expansionLevel={expansionLevel}
					notFirst={i > 0}
					selectedExpId={selectedExpId}
					nestingLimit={nestingLimit}
					expandedExpIds={expandedExpIds}
					onExpClicked={onExpClicked}
					onCollapsedExpClicked={onCollapsedExpClicked}
					/>
			);
		});


	return (
		<div
			style={[
				levelStyles,
				expansionLevel > 0 && level === 1 && expandedLevelStyles
			]}
			onClick={(e) => expClicked(e, expr)}>
			{ level > nestingLimit ? '...' : exprMarkup }
			{ expandedMarkup }
		</div>
	);
});

export default ExpressionView;
