import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import sp from 'lib/stopPropagation'
import {
	getNode
} from 'ast'

export default compose(
	name('NumberExpressionView'), Radium
)(p => {
	const e = getNode(p.program, p.expressionId);
	const s = computeStyles(p);

	return (
		<div style={[s.piece, s.selectable]}>
			<span
				onClick={sp(p.onClick, p.expressionId, p.expansionLevel)}
				>{ e.value }</span>
		</div>
	);
});
