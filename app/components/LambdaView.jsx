import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import colors from 'styles/colors'
import ExpressionView from 'components/ExpressionView'

const LambdaView = compose(
	name('LambdaView'), Radium
)(({
	lambda, nestedDepth, nestingLimit,
	selectedExpId, expandedExpIds,
	onExpClicked, onCollapsedExpClicked,
	onIncreaseNestingClicked, onDecreaseNestingClicked
}) => {
	const
		headerStyles = {
			fontFamily: 'sans-serif',
			color: '#666',
			fontSize: '25px',
			borderBottom: '1px dashed #ddd',
			marginBottom: 5
		},
		titleStyles = {
			padding: 15,
			display: 'inline-block'
		},
		nestingBtnStyles = {
			float: 'right',
			lineHeight: '55px',
			cursor: 'pointer',
			width: 55,
			textAlign: 'center',
			':hover': {
				backgroundColor: '#eee'
			},
			':active': {
				backgroundColor: '#ddd'
			}
		},
		nestingInfoStyles = {
			float: 'right',
			lineHeight: '55px',
			fontSize: 13,
			paddingRight: 10
		},
		disabledStyles = {
			color: '#ddd',
			backgroundColor: 'transparent',
			':hover': { backgroundColor: 'transparent' },
			':active': {backgroundColor: 'transparent' }
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
					style={[
						nestingBtnStyles,
						nestingLimit === nestedDepth && disabledStyles
					]}
					onClick={() => nestingLimit !== nestedDepth
						&& onIncreaseNestingClicked()}>+</div>
				<div
					key="decrementNestingBtn"
					style={[
						nestingBtnStyles,
						nestingLimit === 0 && disabledStyles
					]}
					onClick={() => nestingLimit > 0
						&& onDecreaseNestingClicked()}>-</div>
				<span style={nestingInfoStyles}>{`(${nestingLimit})`}</span>
			</div>
			<ExpressionView
				expr={lambda.body}
				level={1} expansionLevel={0}
				selectedExpId={selectedExpId}
				expandedExpIds={expandedExpIds}
				nestingLimit={nestingLimit}
				onExpClicked={onExpClicked}
				onCollapsedExpClicked={onCollapsedExpClicked} />
		</div>
	);
});

export default LambdaView;
