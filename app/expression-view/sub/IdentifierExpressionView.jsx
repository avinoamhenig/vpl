import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import sp from 'lib/stopPropagation'
import {
	getNode,
	getIdentifier,
	getExpressionType,
	expressionType
} from 'ast'

export default compose(
	name('IdentifierExpressionView'), Radium
)(p => {
	const e = getNode(p.program, p.expressionId);
	const i = getIdentifier(p.program, e.identifier);
	const s = computeStyles(p);

	let isAppliedFn = false;
	const parentNode = getNode(p.program, e.parent);
	if (parentNode
	 && getExpressionType(parentNode) === expressionType.APPLICATION
   && parentNode.lambda === e.id) {
		isAppliedFn = true;
	}

	return (
		<div style={[s.piece, s.selectable]}>
			<span
				style={isAppliedFn ? s.appFn : []}
				onClick={isAppliedFn
					? sp(p.onExpand, { select: e.id, expand: i.value }, p.expansionLevel)
					: sp(p.onClick, p.expressionId, p.expansionLevel)}
				>
				{ i.displayName }
			</span>
		</div>
	);
});
