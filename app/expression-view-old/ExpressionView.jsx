import React from 'react'
import name from 'lib/name'
import sp from 'lib/stopPropagation'
import Radium from 'radium'
import { compose } from 'redux'
import { connect } from 'lib/connect-cancel'
import { computeStyles, computePieceStyles } from './styles'
import LambdaView from 'lambda-view'

const ExpressionView = compose(
	name('ExpressionView'), Radium
)(p => {
	const s = computeStyles(p);
	const expr = p.expr;

	if (expr.syntaxTag === 'function_def') {
		return (
			<div style={s.expandedContainer} className="expandedContainer">
				<div style={s.expression}>
					<LambdaView
						lambda={expr}
						hideButtons={true}
						expansionLevel={p.expansionLevel} />
				</div>
			</div>
		);
	}

	let expandedMarkup = null;
	const
		pieces = exprToPieces(expr, p.ignoreInfix),

		piecesMarkup = pieces.map((piece, i) => {
			const pieceStyles = computePieceStyles(p, piece, i);
			let hasExpansion = false;

			if (piece.isSimple) {
				let expandableFn = false;
				let fn = false;
				if (piece.isFn) {
					fn = getLambdaByName(piece.string, p.ast);
					if (fn) { expandableFn = true; }
					if (fn && p.expandedExpIds[p.expansionLevel] === fn.id) {
						expandedMarkup = (
							<ExpressionView {...p}
								key={`expand_${piece.id}`}
								expr={fn}
								level={1} notFirst={false}
								expansionLevel={p.expansionLevel + 1}
								/>
						);
						hasExpansion = true;
					}
				}

				return (
					<span
						key={piece.id}
						style={[pieceStyles]}
						onClick={expandableFn ?
							  sp(p.onCollapsedExpClicked, { fn, expr: piece.exp },
								   p.expansionLevel)
							: sp(p.onExpClicked, piece.exp, p.expansionLevel)
						}>
						{piece.string}
						{hasExpansion && (
							<div style={s.arrowContainer}><div style={s.arrow}></div></div>
						)}
					</span>
				);
			}

			if (piece.id === p.expandedExpIds[p.expansionLevel]) {
				expandedMarkup = (
					<ExpressionView {...p}
						key={`expand_${piece.id}`}
						expr={piece} level={1} notFirst={false}
						expansionLevel={p.expansionLevel + 1}
						/>
				);
				hasExpansion = true;
			}

			if (p.level >= p.nestingLimit) {
				return (
					<span
						key={piece.id}
						style={[pieceStyles]}
						onClick={sp(p.onCollapsedExpClicked, piece, p.expansionLevel)}>
						{'...'}
						{hasExpansion && (
							<div style={s.arrowContainer}><div style={s.arrow}></div></div>
						)}
					</span>
				);
			}

			return (
				<span key={piece.id}>
					<ExpressionView {...p}
						expr={piece}
						level={p.level + 1}
						notFirst={i > 0}
						/>
					{hasExpansion && (
						<div style={s.arrowContainer}><div style={s.arrow}></div></div>
					)}
				</span>
			);
		}),

		markup = (
			<div
				style={s.expression}
				onClick={sp(p.onExpClicked, expr, p.expansionLevel)}>
				{ p.level > p.nestingLimit ? '...' : piecesMarkup }
				{ expandedMarkup }
			</div>
		);

	if (p.expansionLevel > 0 && p.level === 1
		&& p.expandedExpIds[p.expansionLevel - 1] === expr.id) {
		return (
			<div style={s.expandedContainer} className="expandedContainer">
				{markup}
			</div>
		);
	}

	return markup;
});

export default ExpressionView;
