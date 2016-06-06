import React from 'react'
import name from 'lib/name'
import sp from 'lib/stopPropagation'
import Radium from 'radium'
import { exprToPieces } from 'ast'
import { compose } from 'redux'
import { computeStyles, computePieceStyles } from './styles'

const ExpressionView = compose(
	name('ExpressionView'), Radium
)(p => {
	let expandedMarkup = null;
	const
		pieces = exprToPieces(p.expr, p.ignoreInfix),
		s = computeStyles(p),

		piecesMarkup = pieces.map((piece, i) => {
			const pieceStyles = computePieceStyles(p, piece, i);

			if (piece.isSimple) {
				return (
					<span
						key={piece.id}
						style={[pieceStyles]}
						onClick={piece.isFn ?
							  sp(p.onFunctionClicked, piece.exp, p.expansionLevel)
							: sp(p.onExpClicked, piece.exp, p.expansionLevel)}>
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
							<div style={s.arrowContainer}><div style={s.arrow}></div></div>)}
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
		}),

		markup = (
			<div
				style={s.expression}
				onClick={sp(p.onExpClicked, p.expr, p.expansionLevel)}>
				{ p.level > p.nestingLimit ? '...' : piecesMarkup }
				{ expandedMarkup }
			</div>
		);

	if (p.expansionLevel > 0 && p.level === 1) {
		return (
			<div>
				<div style={s.expandedContainer}>
					{markup}
				</div>
			</div>
		);
	}

	return markup;
});

export default ExpressionView;
