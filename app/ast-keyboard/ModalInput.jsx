import React from 'react'
import { compose } from 'redux'
import name from 'lib/name'
import Radium from 'radium'
import computeStyles from './modalInputStyles'

@Radium
export default class ModalInput extends React.Component {
	render() {
		const s = computeStyles(this.props);

		return (
			<div style={s.container}>
				<input
					type="text"
					style={s.input}
					focused={true}
					ref="input" />
				<button
					style={s.button}
					onClick={() => this.props.onDone(this.refs.input.value)}
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
