import React from 'react'
import { Provider } from 'react-redux'
import App from 'containers/App'
import name from 'lib/name'

let devTools;
if (__DEV__){
	const DevTools = require('containers/DevTools').default;
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
					<App />
					{this.state.isMounted && devTools }
				</div>
			</Provider>
		)
	}
};
