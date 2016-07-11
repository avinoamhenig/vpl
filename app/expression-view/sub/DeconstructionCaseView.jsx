import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import Icon from 'lib/Icon'
import sp from 'lib/stopPropagation'
import subExpression from './subExpression'
import {
	getNode
} from 'ast'

export default compose(
	name('DeconstructionCaseView'), Radium
)(p => {
	const e = getNode(p.program, p.expressionId);
	const s = computeStyles(p);

	const exp = subExpression(p, e.expression);

	return (
		<div
			style={s.expression}
			onClick={sp(p.onClick, p.expressionId, p.expansionLevel)}
			>
			<div style={s.leaf}>
				<div style={[s.piece]}>
					{p.program.constructors[e.constructor].displayName}
				</div>
			</div>
			{ e.parameterIdentifiers.map(identId => (
				<div style={s.leaf} key={identId}>
					<div style={[s.piece]}>
						{p.program.identifiers[identId].displayName}
					</div>
				</div>
			)) }
			<div style={s.leaf}>
				<div style={[s.smallPiece, s.light]}>
					<Icon icon="arrow-right" />
				</div>
			</div>
			{ exp }
		</div>
	);
});
