import React from 'react'
import name from '../lib/name'
import Radium from 'radium'
import colors from '../styles/colors'
import ExpressionView from './ExpressionView'

const LambdaView = name('LambdaView')(Radium(({ lambda }) => {
	let headerStyles = {
		fontFamily: 'sans-serif',
		color: '#666',
		fontSize: '25px',
		padding: '15px',
		borderBottom: '1px dashed #ddd',
		marginBottom: 15
	};

	return (
		<div>
			<div className="lambda_header" style={headerStyles}>
				<span style={{ 'color': '#bbb' }}>&lambda;</span>
				{ ' ' + lambda.name }
				<span style={{ 'color': colors.identifier }}>
					{ ' ' + lambda.args.join(' ') }
				</span>
			</div>
			<ExpressionView expr={lambda.body} level={0} />
		</div>
	);
}));

export default LambdaView;
