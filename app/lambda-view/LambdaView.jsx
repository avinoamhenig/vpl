import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './styles'
import ExpressionView from 'expression-view'
import $ from 'jquery'
import debounce from 'debounce'
import Icon from 'lib/Icon'
import * as evaluator from '../../evaluators/trampoline_evaluator'
import sp from 'lib/stopPropagation'
import round from 'lib/round'
import {
	getNode,
	getIdentifier,
	getRootScopeLambdaIdentifiers
} from 'ast'

export default compose(
	name('LambdaView'), Radium
)(p => {
	const s = computeStyles(p);
	const prog = p.program;
	const ident = p.identifier;
	const lambda = ident ? getNode(prog, ident.value) : null;

	return (
		<div style={s.container}>
			<div className="lambda_header" style={s.header}>
				{ ident && (
					<div style={s.title}>
						{ !p.hideButtons && (
								<div
									key="backbtn"
									style={s.backBtn}
									onClick={() => window.history.back()}
									><Icon icon="chevron-left" /></div>
						) }
						<span
							style={s.displayName}
							onClick={() => (p.onClick || p.selectExp)(ident.id, -1)}
							>
							<span style={s.lambdaIcon}>&lambda;</span>
							{ ' ' + ident.displayName }
						</span>
						<span style={s.args}>
							{ lambda.arguments.map(arg => {
								const ident = getIdentifier(prog, arg);
								return (
									<span
										key={ident.id}
										style={[s.arg, p.selectedExpId === ident.id && s.selectedArg]}
										onClick={() => (p.onClick || p.selectExp)(ident.id, -1)}
										>
										{ ident.displayName }
									</span>
								);
							}) }
						</span>
					</div>
				) }
				{ !p.hideButtons && (
					<span>
						<div
							key="fnlist_btn"
							style={s.fnListBtn}
							onClick={() => p.toggleFnList() }>
							<Icon icon="caret-square-o-down" />
							<div style={s.fnListDrop}>
								<ul>
									<li style={s.lambdaListItem}>
										<span
											key="home"
											style={s.addLambdaButton}
											onClick={sp(() => p.navigate('/'))}>
											<Icon icon="home" />
										</span>
									</li>
									{ getRootScopeLambdaIdentifiers(p.program).map(ident => (
										<li style={s.lambdaListItem} key={ident.id}>
											<a
												href={`#/fn/${ident.id}`}
												key={ident.id}
												style={s.lambdaLink}
												onClick={e => {
													e.preventDefault();
													e.stopPropagation();
													p.navigate(`/fn/${ident.id}`);
												}}>{ident.displayName}</a>
										</li>
									)) }
									<li style={s.lambdaListItem}>
										<span
											key="add_lambda"
											style={s.addLambdaButton}
											onClick={sp(p.newFunction)}>
											<Icon icon="plus" />
										</span>
									</li>
								</ul>
							</div>
						</div>
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
				{ !ident && (
					<span>
						<div
							key="import_btn"
							style={s.leftBtn}
							onClick={() => p.loadSchemeProgram(prompt('Scheme code:'))}>
							<Icon icon="upload" />
						</div>
						<div
							key="run_btn"
							style={s.runBtn}
							className={
								`fa fa-${p.evaluating ? 'stop' : 'play'}`}
							onClick={(e) => {
								e.stopPropagation();
								if (p.evaluating) {
									evaluator.stopEval();
								} else {
									p.startEval(performance.now());
									evaluator.evaluate(p.program, val => {
										p.setEvalResult(val, performance.now())
									}, () => {
										p.evalFail();
									});
								}
							}}></div>
						<div style={s.evalResult}>
							{p.evalFailed ? 'Fail!' : p.evalResult }
						</div>
						<div style={s.evalTime}>
							{ p.evalResult && round(
								(p.evalEndTime - p.evalStartTime) / 1000,
								3
							) + 's' }
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
					expressionId={lambda ? lambda.body : p.expressionId}
					lambdaIdentId={ident ? ident.id : null}
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
