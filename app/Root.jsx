import React from 'react'
import { Provider } from 'react-redux'
import Main from 'main'
import name from 'lib/name'

let devTools;
if (__DEV__){
	const DevTools = require('lib/DevTools').default;
	devTools = <DevTools />;
}

export default class Root extends React.Component {
	constructor(props) {
		super(props)
		this.state = { isMounted: false }
	}

	componentDidMount() {
		this.setState({ isMounted: true })
	}

	render() {
		return (
			<Provider store={this.props.store}>
				<div>
					<Main />
					{this.state.isMounted && devTools }
				</div>
			</Provider>
		)
	}
};
