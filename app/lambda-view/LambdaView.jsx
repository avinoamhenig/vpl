import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './styles'
import ExpressionView from 'expression-view'
import $ from 'jquery'
import debounce from 'debounce'
import {
	getNode,
	getIdentifier
} from 'ast'

export default compose(
	name('LambdaView'), Radium
)(p => {
	const s = computeStyles(p);
	const prog = p.program;
	const ident = p.identifier;
	const lambda = getNode(prog, ident.value);

	return (
		<div style={s.container}>
			<div className="lambda_header" style={s.header}>
				<div style={s.title}>
					<span style={s.lambdaIcon}>&lambda;</span>
					{ ' ' + ident.displayName }
					<span style={s.arg}>
						{ ' '
						+ lambda.arguments.map(arg =>
								getIdentifier(prog, arg).displayName
							).join(' ') }
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
				{/* TODO deal with 'main' and run */}
				{ ident.displayName === 'main' && (
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
							p.navigate(`/fn/${ident.id}`);
						}}></div>
				)}
			</div>
			<div style={s.expressionContainer}>
				<ExpressionView
					expressionId={lambda.body}
					lambdaIdentId={ident.id}
					program={prog}
					nestedLevel={0}
					expansionLevel={p.expansionLevel || 0}
					selectedExpId={p.selectedExpId}
					ignoreInfix={p.ignoreInfix}
					expandedExpIds={p.expandedExpIds}
					nestingLimit={p.nestingLimit}
					onClick={p.onClick || p.selectExp}
					onExpand={p.onExpand || p.toggleExpansion}
					navigate={p.navigate}
					/>
			</div>
		</div>
	);
});
