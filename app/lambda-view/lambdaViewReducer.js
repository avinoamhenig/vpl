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
	createProgram
} from 'ast'
import { basisFragment } from 'basis'

export const actions = {
	selectExp: cA('SELECT_EXP', m('exprId', 'expansionLevel')),
	setNestingLimit: cA('SET_NESTING_LIMIT'),
	incNestingLimit: cA('INC_NESTING_LIMIT'),
	decNestingLimit: cA('DEC_NESTING_LIMIT'),
	expandExp: cA('EXPAND_EXP', m('expr', 'expansionLevel')),
	collapseExpansion: cA('COLLAPSE_EXPANSION'),
	toggleExpansion: cA('TOGGLE_EXPANSION', m('n', 'expansionLevel')),
	toggleInfix: cA('TOGGLE_INFIX'),
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
		dispatch(a.selectExp(
			(dirs[direction])(
				program, lambdaView.selectedExpId, lambdaView.ignoreInfix),
			lambdaView.selectedExpansionLevel
		));
	}
};

const a = actions;
export default createReducer({
	[a.selectExp]: (state, payload) => ({
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
		evaluating: false
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

	[astActions.replaceExp]: (state, { exp, idToReplace }) => {
		if (idToReplace === state.selectedExpId
		 || state.expandedExpIds.includes(idToReplace)) {

			const node = rootNode(exp, expressionType);
			const toSelect = ({
				[expressionType.APPLICATION]: () => node.lambda,
				[expressionType.CASE]: () =>
					getNode(exp, node.caseBranches[0]).condition
			}[getNodeOrExpType(node)] || (() => exp.rootNode))();

			return {
				...state,
				selectedExpId: idToReplace === state.selectedExpId
					? toSelect : state.selectedExpId,
				expandedExpIds: state.expandedExpIds.map(id =>
					id === idToReplace ? exp.rootNode : id)
			};
		}
		return state;
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
	evalResult: '',
	showEvalResult: false,
	evalStartTime: -1,
	evalEndTime: -1,
	evalFailed: false,
	showFnList: false,
	showCanvas: false
});
