import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import { actions as astActions } from 'program'
import * as routeActions from 'lib/route-reducer/action-types'

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
	setEvalResult: cA('SET_EVAL_RESULT'),
	toggleFnList: cA('TOGGLE_FN_LIST')
};

const a = actions;
export default createReducer({
	[a.selectExp]: (state, payload) => ({
		...state,
		selectedExpId: payload.exprId,
		expandedExpIds:
			state.expandedExpIds.slice(0, payload.expansionLevel)
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
	[a.startEval]: state => ({
		...state, evaluating: true, evalResult: '', evalFailed: false
	}),
	[a.setEvalResult]: (state, payload) => ({
		...state, evalResult: JSON.stringify(payload), evaluating: false
	}),
	[a.evalFail]: (state) => ({
		...state, evalResult: '', evaluating: false, evalFailed: true
	}),

	[astActions.replaceExp]: (state, { exp, idToReplace }) => {
		if (idToReplace === state.selectedExpId
		 || state.expandedExpIds.includes(idToReplace)) {
			return {
				...state,
				selectedExpId: idToReplace === state.selectedExpId
					? exp.rootNode : state.selectedExpId,
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
	expandedExpIds: [],
	nestingLimit: 10,
	ignoreInfix: false,
	evaluating: false,
	evalResult: '',
	evalFailed: false,
	showFnList: false
});
