import React from 'react'
import name from '../lib/name'
import Radium from 'radium'
import colors from '../styles/colors'
import ExpressionView from './ExpressionView'

const LambdaView = name('LambdaView')(Radium(({
	lambda, selectedExpId, onExpClicked, setNestingLimit,
	nestingLimit, nestingDepth
}) => {
	let headerStyles = {
		fontFamily: 'sans-serif',
		color: '#666',
		fontSize: '25px',
		borderBottom: '1px dashed #ddd',
		marginBottom: 5
	};
	let titleStyles = {
		padding: 15,
		display: 'inline-block'
	}
	let nestingBtnStyles = {
		float: 'right',
		lineHeight: '55px',
		cursor: 'pointer',
		width: 55,
		textAlign: 'center',
		':hover': {
			backgroundColor: '#eee'
		}
	};
	let nestingInfoStyles = {
		float: 'right',
		lineHeight: '55px',
		fontSize: 13,
		paddingRight: 10
	};

	return (
		<div>
			<div className="lambda_header" style={headerStyles}>
				<div style={titleStyles}>
					<span style={{ 'color': '#bbb' }}>&lambda;</span>
					{ ' ' + lambda.name }
					<span style={{ 'color': colors.identifier }}>
						{ ' ' + lambda.args.join(' ') }
					</span>
				</div>
				<div
					key="incrementNestingBtn"
					style={nestingBtnStyles}
					onClick={() => setNestingLimit(
						Math.min(nestingLimit + 1, nestingDepth))}>+</div>
				<div
					key="decrementNestingBtn"
					style={nestingBtnStyles}
					onClick={() => setNestingLimit(nestingLimit - 1)}>-</div>
				<span style={nestingInfoStyles}>{`(${nestingLimit})`}</span>
			</div>
			<ExpressionView
				expr={lambda.body}
				level={1}
				selectedExpId={selectedExpId}
				onExpClicked={onExpClicked}
				nestingLimit={nestingLimit} />
		</div>
	);
}));

export default LambdaView;
