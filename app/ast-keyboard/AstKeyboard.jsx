import React from 'react'
import { compose } from 'redux'
import name from 'lib/name'
import Radium from 'radium'
import computeStyles from './styles'
import KeyboardButton from './KeyboardButton'
import ModalInput from './ModalInput'
import Icon from 'lib/Icon'

export default compose(
	name('AstKeyboard'), Radium
)(p => {
	const s = computeStyles(p);

	return (
		<div>
			{ p.showTextInput && (<ModalInput onDone={p.onTextEntered} />) }
			<div style={s.container}>
				<div style={s.toggleButton} onClick={p.onTogglePressed}>
					<Icon icon={ p.hidden ? 'plus' : 'minus' } />
				</div>
				{ !p.hidden && p.buttons.map(({ display, value }) => (
					<KeyboardButton
						key={value}
						onClick={() => p.onButtonPressed(value)}>
						{ display }
					</KeyboardButton>
				)) }
			</div>
		</div>
	);
});
