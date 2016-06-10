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
				<div style={s.toolbar}>
					<div
						key="toggle_btn"
						style={s.toggleButton}
						onClick={p.onTogglePressed}>
						<Icon icon={ p.hidden ? 'caret-up' : 'caret-down' } />
					</div>
					<div
						key="remove_btn"
						style={s.rmBtn}
						onClick={p.onRemovePressed}>
						<Icon icon="trash" />
					</div>
					<div
						key="add_btn"
						style={s.addBtn}
						onClick={p.onAddPressed}>
						<Icon icon="plus" />
					</div>
				</div>
				<div style={s.buttonContainer}>
					{ p.buttons.map(({ display, value }) => (
						<KeyboardButton
							key={value}
							onClick={() => p.onButtonPressed(value)}>
							{ display }
						</KeyboardButton>
					)) }
				</div>
			</div>
		</div>
	);
});
