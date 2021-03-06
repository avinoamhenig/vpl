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
} from 'ast'

export default compose(
	name('ConstructionExpressionView'), Radium
)(p => {
	const e = getNode(p.program, p.expressionId);
	const s = computeStyles(p);

	const childNodes = [...e.parameters];
	const children = childNodes.map(id => subExpression(p, id));

	return (
		<div
			style={s.expression}
			onClick={sp(p.onClick, p.expressionId, p.expansionLevel)}
			>
			<div style={s.leaf}>
				<div style={[s.piece]}>
					{ p.program.constructors[e.constructor].displayName }
				</div>
			</div>
			{ children }
		</div>
	);
});
