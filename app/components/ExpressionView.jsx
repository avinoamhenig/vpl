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
			boxSizing: 'border-box',
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
		expandedContainerStyles = {
			position: 'absolute',
			left: 0,
			width: '100%',
			boxSizing: 'border-box',
			paddingTop: 5,
			paddingLeft:  expansionLevel === 1 ? 5 : 2,
			paddingRight: expansionLevel === 1 ? 5 : 2
		},
		expandedLevelStyles = {
			position: 'relative',
			width: '100%',
			top: -8,
			backgroundColor: 'white',
			borderTop: '3px solid ' + colors.selectedExp,
			boxShadow: '0 1px 3px 0 rgba(0,0,0,0.6)',
			borderRadius: 3
		},
		arrowStyles = {
			borderBottom: '9px solid ' + colors.selectedExp,
			borderLeft: '9px solid transparent',
			borderRight: '9px solid transparent',
			borderTop: 'none',
			position: 'absolute',
			width: 0,
			zIndex: 20,
			top: -12,
			right: 6
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


	const markup = (
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

	if (expansionLevel > 0 && level === 1) {
		return (
			<div>
				<div style={{position: 'relative'}}>
					<div style={arrowStyles}></div>
				</div>
				<div style={expandedContainerStyles}>
					{markup}
				</div>
			</div>
		);
	} else {
		return markup;
	}
});

export default ExpressionView;
