import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import colors from 'styles/colors'
import exprToPieces from 'lib/ast/exprToPieces'
import { compose } from 'redux'

const ExpressionView = compose(
	name('ExpressionView'), Radium
)(p => {
	let
		sp = (f, ...args) => e => {
			e.stopPropagation();
			f(...args);
		},
		pieces = exprToPieces(p.expr, p.ignoreInfix),
		levelStyles = {
			boxSizing: 'border-box',
			fontFamily: 'Helvetica Neue, sans-serif',
			fontSize: 35,
			fontWeight: '200',
			minHeight: p.level === 1 ? 'auto' : 70,
			lineHeight: '70px',
			borderRadius: p.level === 2 ? 3 : 0,
			marginLeft: p.notFirst ? 12 : 0,
			padding: p.level === 1 ?
				p.expansionLevel === 0 ? '12px 12px 0 12px'
				                       : '6px 6px 0 6px'
				: '0 7px',
			marginBottom: p.level === 2 ?
				  p.expansionLevel === 0 ? 12 : 6
				: 0,
			backgroundColor: p.selectedExpId === p.expr.id ?
				  colors.selectedExp
				: p.level === 1 ? 'rgba(0,0,0,0)' : colors.exp,
			display: 'inline-block',
			cursor: 'pointer'
		},
		expandedContainerStyles = {
			position: 'absolute',
			left: 0,
			width: '100%',
			boxSizing: 'border-box',
			paddingTop: 5,
			paddingLeft:  p.expansionLevel === 1 ? 5 : 2,
			paddingRight: p.expansionLevel === 1 ? 5 : 2
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
			top: 10,
			right: 5
		},
		expandedMarkup = null,
		exprMarkup = pieces.map((piece, i) => {
			let pieceStyles = {
				paddingLeft: i === 0 ? 3 : 10,
				color: !piece.isBlock && piece.id === p.selectedExpId ?
					colors.selectedExp : '#000'
			};

			if (piece.isSimple) {
				return (
					<span
						key={piece.id}
						style={[pieceStyles]}
						onClick={sp(p.onExpClicked, piece.exp, p.expansionLevel)}>
						{piece.string}
					</span>
				);
			}

			if (p.level >= p.nestingLimit) {
				if (piece.id === p.expandedExpIds[p.expansionLevel]) {
					expandedMarkup = (
						<ExpressionView {...p}
							key={`expand_${piece.id}`}
							expr={piece} level={1} notFirst={false}
							expansionLevel={p.expansionLevel + 1}
							/>
					);
				}
				return (
					<span
						key={piece.id}
						style={[pieceStyles]}
						onClick={sp(p.onCollapsedExpClicked, piece, p.expansionLevel)}>
						{'...'}
						{piece.id === p.expandedExpIds[p.expansionLevel] && (
							<div style={{
									position: 'relative',
									display: 'inline-block'
								}}><div style={arrowStyles}></div></div>)}
					</span>
				);
			}

			return (
				<ExpressionView {...p}
					key={piece.id}
					expr={piece}
					level={p.level + 1}
					notFirst={i > 0}
					/>
			);
		});


	const markup = (
		<div
			style={[
				levelStyles,
				p.expansionLevel > 0 && p.level === 1 && expandedLevelStyles
			]}
			onClick={sp(p.onExpClicked, p.expr, p.expansionLevel)}>
			{ p.level > p.nestingLimit ? '...' : exprMarkup }
			{ expandedMarkup }
		</div>
	);

	if (p.expansionLevel > 0 && p.level === 1) {
		return (
			<div>
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
