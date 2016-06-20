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
import Icon from 'lib/Icon'
import {
	getNode,
	getNodeOrExpType,
	expressionType, nodeType,
	isLeafExpression
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
		}
	}

	return (
		<div style={s.expressionContainer}>
			{ view }
		</div>
	);
});
