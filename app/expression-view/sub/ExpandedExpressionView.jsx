import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import ExpressionView from '../ExpressionView'
import { LambdaView } from 'lambda-view'
import {
	getNode
} from 'ast'

export default compose(
	name('CollapsedExpressionView'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<span>
			<div style={s.arrowContainer}><div style={s.arrow}></div></div>
			<div style={s.expandedContainer}>
				{ p.expandedFn
					? (
						<LambdaView
							{...p}
							lambdaId={p.identifier.value}
							expansionLevel={p.expansionLevel + 1}
							hideButtons={true}
							/>
					)
					: (
						<ExpressionView
							{...p}
							nestedLevel={0}
							expansionLevel={p.expansionLevel + 1}
							/>
					)
				}
			</div>
		</span>
	);
});
