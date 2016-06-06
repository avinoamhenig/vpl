import React from 'react'
import Helmet from 'react-helmet'

export default getHelmetProps => component => {
	return function helmetWrapperComponent(props) {
		return (
			<div>
				{ React.createElement(Helmet,
						typeof getHelmetProps === 'function' ?
							getHelmetProps(props) : getHelmetProps) }
				{ React.createElement(component, props) }
			</div>
		);
	};
};
