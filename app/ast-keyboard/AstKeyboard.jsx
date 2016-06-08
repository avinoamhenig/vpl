import React from 'react'
import { compose } from 'redux'
import name from 'lib/name'
import Radium from 'radium'
import computeStyles from './styles'
import KeyboardButton from './KeyboardButton'

export default compose(
	name('AstKeyboard'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<div style={s.container}>
			{ p.buttons.map(({ display, value }) => (
				<KeyboardButton
					key={value}
					onClick={() => p.onButtonPressed(value)}>
					{ display }
				</KeyboardButton>
			)) }
		</div>
	);
});
