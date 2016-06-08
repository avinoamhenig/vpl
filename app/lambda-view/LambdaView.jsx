import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './styles'
import ExpressionView from 'expression-view'
import AstKeyboard from 'ast-keyboard'

export default compose(
	name('LambdaView'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<div>
			<AstKeyboard />
			<div className="lambda_header" style={s.header}>
				<div style={s.title}>
					<span style={s.lambdaIcon}>&lambda;</span>
					{ ' ' + p.lambda.name }
					<span style={s.arg}>
						{ ' ' + p.lambda.args.join(' ') }
					</span>
				</div>
				{ !p.hideButtons && (
					<span>
						<div
							key="infixBtn"
							style={s.infixBtn}
							className="fa fa-info"
							onClick={p.toggleInfix}></div>
						<div
							key="incrementNestingBtn"
							style={s.incNesting}
							className="fa fa-plus"
							onClick={() => p.incNestingLimit()}></div>
						<div
							key="decrementNestingBtn"
							style={s.decNesting}
							className="fa fa-minus"
							onClick={() => p.nestingLimit > 0
								&& p.decNestingLimit()}></div>
							<span style={s.nestingInfo}>{`(${p.nestingLimit})`}</span>
					</span>
				)}
				{ p.hideButtons && (
					<div
						style={s.openLambda}
						className="fa fa-external-link"
						onClick={(e) => {
							e.stopPropagation();
							p.navigate(`/lambda/${p.lambda.name}`);
						}}></div>
				)}
			</div>
			<ExpressionView
				expr={p.lambda.body}
				level={1} expansionLevel={p.expansionLevel || 0}
				selectedExpId={p.selectedExpId}
				ignoreInfix={p.ignoreInfix}
				expandedExpIds={p.expandedExpIds}
				nestingLimit={p.nestingLimit}
				onExpClicked={p.selectExp}
				onCollapsedExpClicked={p.toggleExpansion} />
		</div>
	);
});
