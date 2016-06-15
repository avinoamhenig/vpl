import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './styles'
import ExpressionView from 'expression-view'
import $ from 'jquery'
import debounce from 'debounce'
import { run, stop } from 'oldast'

@Radium
export default class LambdaView extends React.Component {
	render() {
		const p = this.props;
		const s = computeStyles(p);

		return (
			<div style={s.container}>
				<div className="lambda_header" style={s.header}>
					<div style={s.title}>
						<span style={s.lambdaIcon}>&lambda;</span>
						{ ' ' + p.lambda.name }
						<span style={s.arg}>
							{ ' ' + p.lambda.args.join(' ') }
						</span>
					</div>
					{ !p.hideButtons && (
						<span>
							<div
								key="infixBtn"
								style={s.infixBtn}
								className="fa fa-info"
								onClick={p.toggleInfix}></div>
							<div
								key="incrementNestingBtn"
								style={s.incNesting}
								className="fa fa-plus"
								onClick={() => p.incNestingLimit()}></div>
							<div
								key="decrementNestingBtn"
								style={s.decNesting}
								className="fa fa-minus"
								onClick={() => p.nestingLimit > 0
									&& p.decNestingLimit()}></div>
								<span style={s.nestingInfo}>{`(${p.nestingLimit})`}</span>
						</span>
					)}
					{ p.lambda.name === 'main' && (
						<span>
							<div
								style={s.runBtn}
								className={
									`fa fa-${p.evaluating ? 'stop' : 'play'}`}
								onClick={(e) => {
									e.stopPropagation();
									if (p.evaluating) {
										stop();
									} else {
										p.startEval();
										run(p.ast, val => {
											p.setEvalResult(val)
										}, () => {
											p.evalFail();
										});
									}
								}}></div>
							<div style={s.evalResult}>
								{p.evalFailed ? 'Fail!' : p.evalResult }
							</div>
						</span>
					)}
					{ p.hideButtons && (
						<div
							style={s.openLambda}
							className="fa fa-external-link"
							onClick={(e) => {
								e.stopPropagation();
								p.navigate(`/lambda/${p.lambda.name}`);
							}}></div>
					)}
				</div>
				<div style={s.expressionContainer}>
					<div ref="expressionScrollContainer">
						<ExpressionView
							expr={p.lambda.body}
							level={1} expansionLevel={p.expansionLevel || 0}
							selectedExpId={p.selectedExpId}
							ignoreInfix={p.ignoreInfix}
							expandedExpIds={p.expandedExpIds}
							nestingLimit={p.nestingLimit}
							onExpClicked={p.selectExp}
							onCollapsedExpClicked={(exp, ...args) => {
								if (!exp.fn || exp.fn.id !== p.lambda.id) {
									p.toggleExpansion(exp, ...args);
								} else {
									p.selectExp(exp.expr, ...args);
								}
							}} />
					</div>
				</div>
			</div>
		);
	}

	componentDidMount() {
		if (this.props.expansionLevel === 0) {
			const container = $(this.refs.expressionScrollContainer);

			$(window).on('resize.popupContainerSizing', debounce(() => {
				const containerTop = container.offset().top;
				const lastPop = $('.expandedContainer').last();
				if (lastPop.length > 0) {
					const popBottom = lastPop.offset().top + lastPop.height();
					container.height(popBottom - containerTop);
				} else {
					container.css('height', 'auto');
				}
			}, 100));
		}
	}

	componentDidUpdate() {
		if (this.props.expansionLevel === 0) {
			$(window).trigger('resize.popupContainerSizing');
		}
	}

	componentWillUnmount() {
		if (this.props.expansionLevel === 0) {
			$(window).off('resize.popupContainerSizing');
		}
	}
};
