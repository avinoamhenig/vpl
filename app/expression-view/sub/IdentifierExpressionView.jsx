import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import sp from 'lib/stopPropagation'
import ExpandedExpressionView from './ExpandedExpressionView'
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

	let isExpandable = isAppliedFn
		&& i.value
		&& i.id !== p.lambdaIdentId
		&& getExpressionType(getNode(p.program, i.value)) === expressionType.LAMBDA;

	return (
		<div style={s.leaf}>
			{ p.expandedExpIds[p.expansionLevel] === i.value
				&& i.scope === null
				&& getExpressionType(getNode(p.program, i.value)) === expressionType.LAMBDA
				&& (
				<ExpandedExpressionView
					{...p}
					expandedFn={true}
					identifier={i}
					popupOffsetTop={-10}
					/>
			) }
			<div style={[s.piece, s.selectable]}>
				<span
					style={isAppliedFn ? s.appFn : []}
					onClick={isExpandable
						? sp(p.onExpand, { select: e.id, expand: i.value }, p.expansionLevel)
						: sp(p.onClick, p.expressionId, p.expansionLevel)}
					>
					{ i.displayName }
				</span>
			</div>
		</div>
	);
});
