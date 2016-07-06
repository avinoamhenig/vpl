import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './expressionViewStyles'
import CaseExpressionView from './sub/CaseExpressionView'
import CaseBranchView from './sub/CaseBranchView'
import ElseBranchView from './sub/ElseBranchView'
import ApplicationExpressionView from './sub/ApplicationExpressionView'
import NumberExpressionView from './sub/NumberExpressionView'
import IdentifierExpressionView from './sub/IdentifierExpressionView'
import CollapsedExpressionView from './sub/CollapsedExpressionView'
import ExpandedExpressionView from './sub/ExpandedExpressionView'
import DoExpressionView from './sub/DoExpressionView'
import ConstructionExpressionView from './sub/ConstructionExpressionView'
import Icon from 'lib/Icon'
import sp from 'lib/stopPropagation'
import {
	getNode,
	getNodeOrExpType,
	expressionType, nodeType,
	isLeafExpression,
	getIdentifiersScopedToNode
} from 'ast'

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
		switch (getNodeOrExpType(expression)) {
			case expressionType.NUMBER: view = (
				<NumberExpressionView {...p} />
			); break;
			case expressionType.IDENTIFIER: view = (
				<IdentifierExpressionView {...p} />
			); break;
			case expressionType.LAMBDA:
				// TODO display LambdaExpression
				break;
			case expressionType.APPLICATION: view = (
				<ApplicationExpressionView {...p} />
			); break;
			case expressionType.CASE: view = (
				<CaseExpressionView {...p} />
			); break;
			case nodeType.CASE_BRANCH: view = (
				<CaseBranchView {...p} />
			); break;
			case nodeType.ELSE_BRANCH: view = (
				<ElseBranchView {...p} />
			); break;
			case expressionType.DO: view = (
				<DoExpressionView {...p} />
			); break;
			case expressionType.CONSTRUCTION: view = (
				<ConstructionExpressionView {...p} />
			); break;
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
					getIdentifiersScopedToNode(p.program, p.expressionId).map(ident => (
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
