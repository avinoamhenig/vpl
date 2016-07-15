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
	const {
		toolbarButtons,
		panes,
		selectedPane,
		showTextInput,
		onTextEntered,
		onTogglePressed,
		onPaneSelected,
		show
	} = p;
	const s = computeStyles(p);

	return (
		<div>
			{ showTextInput && (<ModalInput onDone={onTextEntered} />) }
			<div style={s.container}>
				<div style={s.toolbar}>
					<div
						key="toggle_btn"
						style={s.leftButton}
						onClick={onTogglePressed}>
						<Icon icon={ show ? 'caret-down' : 'caret-up' } />
					</div>
					{ panes.map(({ display }, i) => (
						<div
							key={`pane_${i}`}
							style={selectedPane === i ? s.leftButtonSelected : s.leftButton}
							onClick={() => onPaneSelected(i)}>
							{ display }
						</div>
					)) }
					{ toolbarButtons.map(({ display, handler }, i) => (
						<div
							key={`toolbarButton_${i}`}
							style={s.rightButton}
							onClick={handler}>
							{ display }
						</div>
					)) }
				</div>
				<div style={s.buttonContainer}>
					{ panes.length > 0
					&& panes[selectedPane].buttons.map(({ display, handler }, i) => (
						<KeyboardButton
							key={i}
							onClick={handler}>
							{ display }
						</KeyboardButton>
					)) }
				</div>
			</div>
		</div>
	);
});
