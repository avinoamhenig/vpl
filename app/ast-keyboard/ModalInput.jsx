import React from 'react'
import { compose } from 'redux'
import name from 'lib/name'
import Radium from 'radium'
import computeStyles from './modalInputStyles'

@Radium
export default class ModalInput extends React.Component {
	render() {
		const s = computeStyles(this.props);
		const doneHandler = () => this.props.onDone(this.refs.input.value);
		const keyPressHandler = e => {
			if (e.which === 13) {
				doneHandler();
			}
		};

		return (
			<div style={s.container}>
				<input
					type="text"
					autoCapitalize="off" autoComplete="off"
					autoCorrect="off" spellCheck="false"
					style={s.input}
					focused={true}
					onKeyPress={keyPressHandler}
					ref="input"
					/>
				<button
					style={s.button}
					onClick={doneHandler}
					>
					Done
				</button>
			</div>
		);
	}

	componentDidMount() {
		this.refs.input.focus();
	}
}
