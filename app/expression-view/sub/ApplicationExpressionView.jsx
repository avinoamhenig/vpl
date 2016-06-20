import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import Icon from 'lib/Icon'
import sp from 'lib/stopPropagation'
import subExpression from './subExpression'
import {
	getNode,
	isInfixOperator,
	getExpressionType,
	expressionType,
	getIdentifier
} from 'ast'

export default compose(
	name('ApplicationExpressionView'), Radium
)(p => {
	const e = getNode(p.program, p.expressionId);
	const s = computeStyles(p);

	const childNodes = [e.lambda, ...e.arguments];
	const [lambda, ...args] = childNodes.map(id => subExpression(p, id));

	if (!p.ignoreInfix && args.length == 2) {
		const fnExp = getNode(p.program, e.lambda);
		if (getExpressionType(fnExp) === expressionType.IDENTIFIER
		 && isInfixOperator(getIdentifier(p.program, fnExp.identifier))) {
			 return (
				<div
					style={s.expression}
					onClick={sp(p.onClick, p.expressionId, p.expansionLevel)}
					>
					<div style={s.first}>{ args[0] }</div>
					{ lambda  }
					{ args[1] }
				</div>
			);
		}
	}

	return (
		<div
			style={s.expression}
			onClick={sp(p.onClick, p.expressionId, p.expansionLevel)}
			>
			<div style={s.first}>{ lambda }</div>
			{ args }
		</div>
	);
});
