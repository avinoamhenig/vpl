import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import colors from 'styles/colors'
import ExpressionView from 'expression-view'

export default compose(
	name('LambdaView'), Radium
)(p => {
	// TODO Move styles out into their own files/functions?
	// Maybe change dir structure to be by component?
	const
		headerStyles = {
			fontFamily: 'sans-serif',
			color: '#666',
			fontSize: '17px',
			borderBottom: '1px dashed #ddd',
			marginBottom: 5,
			lineHeight: '35px'
		},
		titleStyles = {
			paddingLeft: 8,
			display: 'inline-block'
		},
		nestingBtnStyles = {
			float: 'right',
			lineHeight: '35px',
			cursor: 'pointer',
			width: 30,
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
			lineHeight: '35px',
			fontSize: 13,
			paddingRight: 8
		},
		disabledStyles = {
			color: '#ddd',
			backgroundColor: 'transparent',
			':hover': { backgroundColor: 'transparent' },
			':active': {backgroundColor: 'transparent' }
		},
		infixBtnStyles = {
			color: p.ignoreInfix ? '#666' : colors.selectedExp
		};

	return (
		<div>
			<div className="lambda_header" style={headerStyles}>
				<div style={titleStyles}>
					<span style={{ 'color': '#bbb' }}>&lambda;</span>
					{ ' ' + p.lambda.name }
					<span style={{ 'color': colors.identifier }}>
						{ ' ' + p.lambda.args.join(' ') }
					</span>
				</div>
				<div
					key="infixBtn"
					style={[
						nestingBtnStyles,
						infixBtnStyles
					]}
					className="fa fa-info"
					onClick={p.onInfixToggleClicked}></div>
				<div
					key="incrementNestingBtn"
					style={[
						nestingBtnStyles,
						p.nestingLimit === p.nestedDepth && disabledStyles
					]}
					className="fa fa-plus"
					onClick={() => p.nestingLimit !== p.nestedDepth
						&& p.onIncreaseNestingClicked()}></div>
				<div
					key="decrementNestingBtn"
					style={[
						nestingBtnStyles,
						p.nestingLimit === 0 && disabledStyles
					]}
					className="fa fa-minus"
					onClick={() => p.nestingLimit > 0
						&& p.onDecreaseNestingClicked()}></div>
				<span style={nestingInfoStyles}>{`(${p.nestingLimit})`}</span>
			</div>
			<ExpressionView
				expr={p.lambda.body}
				level={1} expansionLevel={0}
				selectedExpId={p.selectedExpId}
				ignoreInfix={p.ignoreInfix}
				expandedExpIds={p.expandedExpIds}
				nestingLimit={p.nestingLimit}
				onExpClicked={p.onExpClicked}
				onCollapsedExpClicked={p.onCollapsedExpClicked}
				onFunctionClicked={p.onFunctionClicked} />
		</div>
	);
});
