import React from 'react'
import Helmet from 'react-helmet'

export default getHelmetProps => component => {
	return function helmetWrapperComponent(props) {
		return (
			<div>
				{ React.createElement(Helmet, getHelmetProps(props)) }
				{ React.createElement(component, props) }
			</div>
		);
	};
};
