import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from './styles'
import ExpressionView from 'expression-view'
import Icon from 'lib/Icon'
import * as evaluator from '../../evaluators/evaluator-data-constructors'
import sp from 'lib/stopPropagation'
import round from 'lib/round'
import ExpandedExpressionView from 'expression-view/sub/ExpandedExpressionView'
import Canvas from './Canvas'
import turtle from 'lib/turtle'
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

	const drawSnowflake = () => {
		const {
			draw, move, turn, done
		} = turtle(document.getElementById('render_canvas'));

		function koch(size, depth) {
			if (depth === 0) {
				draw(size)
			} else {
				koch(size/3, depth - 1)
				turn(60)
				koch(size/3, depth - 1)
				turn(-120)
				koch(size/3, depth - 1)
				turn(60)
				koch(size/3, depth - 1)
			}
		}

		move(-250)
		turn(90)
		move(145)
		turn(-90)

		koch(500, 5)
		turn(-120)
		koch(500, 5)
		turn(-120)
		koch(500, 5)

		done();
	};

	return (
		<div style={s.container} id="root_expression">
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
										p.setEvalResult(val, performance.now(), p.program)
									}, () => {
										p.evalFail();
									});
								}
							}}></div>
						<div style={s.evalResult}>
							{ p.evalFailed ? 'Fail!' : p.evalResult && (
								<span onClick={p.toggleEvalResult}>
									<Icon icon={p.showEvalResult ? 'eye' : 'eye-slash'} />
								</span>
							) }
						</div>
						<div style={s.canvasToggle}>
							{ p.evalResult && (
								<span onClick={p.toggleCanvas}>
									<Icon icon="pencil-square-o" />
								</span>
							) }
						</div>
						<div style={s.runBtn}>
							{ p.evalResult && (
								<span onClick={drawSnowflake}>
									<Icon icon="pencil-square" />
								</span>
							) }
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
				{ !ident && (
					<Canvas
						id="render_canvas"
						style={s.canvas}
						/>
				) }
				<ExpressionView
					expressionId={lambda
						? lambda.body
						: p.showEvalResult
							? p.evalResult.expression
							: p.expressionId}
					lambdaIdentId={ident ? ident.id : null}
					program={p.showEvalResult ? p.evalResult : prog}
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
