import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import Icon from 'lib/Icon'
import sp from 'lib/stopPropagation'
import ExpandedExpressionView from './ExpandedExpressionView'
import {
	getNode
} from 'ast'

export default compose(
	name('CollapsedExpressionView'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<div style={s.leaf}>
			{ p.expandedExpIds[p.expansionLevel] === p.expressionId && (
				<ExpandedExpressionView {...p} />
			) }
			<div style={s.expandPiece}>
				<span
					onClick={sp(p.onExpand, p.expressionId, p.expansionLevel)}
					>
					<Icon icon="toggle-down" />
				</span>
			</div>
		</div>
	);
});
