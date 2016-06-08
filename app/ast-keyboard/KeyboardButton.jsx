import React from 'react'
import { compose } from 'redux'
import name from 'lib/name'
import Radium from 'radium'
import computeStyles from './buttonStyles'

export default compose(
	name('KeyboardButton'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<div
			style={s.buttonContainer}
			onClick={p.onClick}>
			{ p.children }
		</div>
	);
});
