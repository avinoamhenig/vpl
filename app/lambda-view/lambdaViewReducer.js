import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import { actions as astActions } from 'program'
import * as routeActions from 'lib/route-reducer/action-types'
import {
	rootNode,
	getNodeOrExpType,
	expressionType,
	nodeType,
	getNode,
	getNodeToTheLeft, getNodeToTheRight,
	getNodeInside, getNodeOutside,
	createProgram,
	getType,
	typeString,
	getEntity
} from 'ast'
import { basisFragment } from 'basis'

export const actions = {
	selectExpression: cA('SELECT_EXP', m('exprId', 'expansionLevel')),
	selectExp: (exprId, expansionLevel) => (dispatch, getState) => {
		const { program } = getState();
		console.log(typeString(program, getType(program, exprId)));
		dispatch(a.selectExpression(exprId, expansionLevel));
	},
	setNestingLimit: cA('SET_NESTING_LIMIT'),
	incNestingLimit: cA('INC_NESTING_LIMIT'),
	decNestingLimit: cA('DEC_NESTING_LIMIT'),
	expandExp: cA('EXPAND_EXP', m('expr', 'expansionLevel')),
	collapseExpansion: cA('COLLAPSE_EXPANSION'),
	toggleExpansion: cA('TOGGLE_EXPANSION', m('n', 'expansionLevel')),
	toggleInfix: cA('TOGGLE_INFIX'),
	toggleStepMode: cA('TOGGLE_STEP_MODE'),
	startEval: cA('START_EVAL'),
	evalFail: cA('EVAL_FAIL'),
	setEvalResult: cA('SET_EVAL_RESULT', m('result', 'time', 'program')),
	toggleFnList: cA('TOGGLE_FN_LIST'),
	toggleEvalResult: cA('TOGGLE_EVAL_RESULT'),
	toggleCanvas: cA('TOGGLE_CANVAS'),
	move: direction => (dispatch, getState) => {
		const { program, lambdaView } = getState();
		if (!lambdaView.selectedExpId) return;
		const dirs = {
			left: getNodeToTheLeft,
			right: getNodeToTheRight,
			down: getNodeInside,
			up: getNodeOutside
		};
		dispatch(a.selectExpression(
			(dirs[direction])(
				program, lambdaView.selectedExpId, lambdaView.ignoreInfix),
			lambdaView.selectedExpansionLevel
		));
	}
};

const a = actions;
export default createReducer({
	[a.selectExpression]: (state, payload) => ({
		...state,
		showFnList: false,
		selectedExpId: payload.exprId,
		selectedExpansionLevel: payload.expansionLevel,
		expandedExpIds: payload.expansionLevel === -1
			? state.expandedExpIds
			: state.expandedExpIds.slice(0, payload.expansionLevel)
	}),

	[a.setNestingLimit]: (state, payload) => ({
		...state,
		nestingLimit: Math.max(0, payload),
		expandedExpIds: []
	}),
	[a.incNestingLimit]: (state, payload) => ({
		...state,
		nestingLimit: state.nestingLimit + 1
	}),
	[a.decNestingLimit]: (state, payload) => ({
		...state,
		nestingLimit: Math.max(0, state.nestingLimit - 1),
		expandedExpIds: []
	}),

	[a.toggleExpansion]: (state, { n, expansionLevel }) => {
		const expanded = typeof n === 'object' ? n.expand : n;
		const selected = typeof n === 'object' ? n.select : n;
		const shouldCollapse =
			state.expandedExpIds.length > expansionLevel && state.expandedExpIds[expansionLevel] === expanded;
		const shouldExpand = !shouldCollapse &&
			state.expandedExpIds.filter(id => id === expanded).length === 0;

		return {
			...state,
			selectedExpId: shouldCollapse ? state.selectedExpId : selected,
			selectedExpansionLevel: expansionLevel,
			expandedExpIds: shouldCollapse
				? state.expandedExpIds.slice(0, expansionLevel)
				: shouldExpand
					? [ ...state.expandedExpIds.slice(0, expansionLevel),
					    expanded ]
					: state.expandedExpIds
		};
	},
	[a.toggleInfix]: state => ({
		...state, ignoreInfix: !state.ignoreInfix
	}),
	[a.toggleStepMode]: state => ({
		...state, stepMode: !state.stepMode
	}),
	[a.startEval]: (state, time) => ({
		...state,
		evaluating: true,
		evalResult: '',
		evalFailed: false,
		evalStartTime: time,
		evalEndTime: -1
	}),
	[a.setEvalResult]: (state, { result, time, program }) => ({
		...state,
		evalResult: createProgram(program, result),
		evalEndTime: time,
		evaluating: false,
		showEvalResult: !state.showCanvas ? true : state.showEvalResult
	}),
	[a.toggleEvalResult]: state => ({
		...state,
		showEvalResult: !state.showEvalResult,
		showCanvas: !state.showEvalResult ? false : state.showCanvas
	}),
	[a.evalFail]: (state) => ({
		...state, evalResult: '', evaluating: false, evalFailed: true
	}),
	[a.toggleCanvas]: state => ({
		...state,
		showCanvas: !state.showCanvas,
		showEvalResult: !state.showCanvas ? false : state.showEvalResult
	}),

	[astActions.replaceAst]: (state, { newProgram, idReplaced, replacementId }) => {
		if (!getEntity(newProgram, idReplaced)) {
			return {
				...state,
				selectedExpId: idReplaced === state.selectedExpId
					? replacementId : state.selectedExpId,
				expandedExpIds: state.expandedExpIds.map(id =>
					id === idReplaced ? replacementId : id)
			};
		}
		return state;
	},
	[astActions.loadJSONProgram]: state => {
		return {
			...state,
			selectedExpId: null,
			selectedExpansionLevel: 0,
			expandedExpIds: [],
			evaluating: false,
			evalResult: null,
			showEvalResult: false
		};
	},
	[astActions.resetRoot]: state => {
		return {
			...state,
			selectedExpId: null,
			selectedExpansionLevel: 0,
			expandedExpIds: []
		};
	},
	[astActions.removeExp]: (state, expId) => {
		if (expId === state.selectedExpId
		 || state.expandedExpIds.includes(expId)) {
			return {
				...state,
				selectedExpId: expId === state.selectedExpId
					? null : state.selectedExpId,
				expandedExpIds:
					state.expandedExpIds.slice(state.expandedExpIds.indexOf(expId) + 1)
			};
		}
		return state;
	},
	[astActions.bindIdentifier]: (state, { identifier }) => ({
		...state,
		selectedExpId: identifier.id
	}),

	[routeActions.NAVIGATE]: state => ({
		...state,
		expandedExpIds: [],
		showFnList: false
	}),

	[a.toggleFnList]: state => ({
		...state,
		showFnList: !state.showFnList
	})
}, {
	selectedExpId: null,
	selectedExpansionLevel: 0,
	expandedExpIds: [],
	nestingLimit: 10,
	ignoreInfix: false,
	evaluating: false,
	evalResult: null,
	showEvalResult: false,
	evalStartTime: -1,
	evalEndTime: -1,
	evalFailed: false,
	showFnList: false,
	showCanvas: false,
	stepMode: false
});
