import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import ExpressionView from '../ExpressionView'
import Icon from 'lib/Icon'
import sp from 'lib/stopPropagation'
import {
	getNode
} from 'ast'

export default compose(
	name('CollapsedExpressionView'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<div style={s.expandPiece}>
			<span
				onClick={sp(p.onExpand, p.expressionId, p.expansionLevel)}
				><Icon icon="toggle-down" /></span>
				{ p.expandedExpIds[p.expansionLevel] === p.expressionId && (
					<div>Expand!</div>
				) }
		</div>
	);
});
