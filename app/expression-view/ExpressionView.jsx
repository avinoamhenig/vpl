import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './expressionViewStyles'
import Icon from 'lib/Icon'
import sp from 'lib/stopPropagation'
import {
	getNode,
	getNodeOrExpType,
	expressionType, nodeType,
	isLeafExpression,
	getBoundIdentifiers
} from 'ast'
import * as sub from './sub'
import CollapsedExpressionView from './sub/CollapsedExpressionView'
import ExpandedExpressionView from './sub/ExpandedExpressionView'

export default compose(
	name('ExpressionView'), Radium
)(p => {
	const expression = getNode(p.program, p.expressionId);
	const s = computeStyles(p);
	let view = (
		<div style={s.expression}>
			<div style={s.piece}>
				<Icon icon="exclamation-triangle" />
			</div>
		</div>
	);

	if (p.nestedLevel > p.nestingLimit && !isLeafExpression(expression)) {
		view = (<CollapsedExpressionView {...p} />);
	} else {
		const cName = getNodeOrExpType(expression) + 'View';
		const Component = sub[cName];
		if (typeof Component !== 'undefined') {
			view = (<Component {...p} />);
		}
	}

	return (
		<span id={
				p.nestedLevel === 0
					? `exp_cont_${p.lambdaIdentId}_${p.expansionLevel}`
					: ''
			}
			style={s.expressionWrapper}>
			<div style={s.scopedIdentContainer}>
				{ (p.nestedLevel <= p.nestingLimit
						|| isLeafExpression(expression)) &&
					getBoundIdentifiers(p.program, p.expressionId).map(ident => (
					<div
						key={ident.id}
						style={[
							s.scopedIdentifier,
							p.selectedExpId === ident.id && s.selectedIdentifier
						]}
						onClick={ sp(p.onExpand, {
							select: ident.id,
							expand: ident.value },
						p.expansionLevel) }
						>
						{ p.expandedExpIds[p.expansionLevel] === ident.value && (
							<ExpandedExpressionView
								{...p}
								expressionId={ident.value}
								expandedFn={false}
								popupOffsetTop={5}
								/>
						) }
						{ident.displayName}
					</div>
				)) }
			</div>
			{ view }
		</span>
	);
});
