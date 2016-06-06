import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'

export const actions = {
	selectExp: cA('SELECT_EXP', m('expr', 'expansionLevel')),
	setNestingLimit: cA('SET_NESTING_LIMIT'),
	incNestingLimit: cA('INC_NESTING_LIMIT'),
	decNestingLimit: cA('DEC_NESTING_LIMIT'),
	expandExp: cA('EXPAND_EXP', m('expr', 'expansionLevel')),
	collapseExpansion: cA('COLLAPSE_EXPANSION'),
	toggleExpansion: cA('TOGGLE_EXPANSION', m('expr', 'expansionLevel')),
	toggleInfix: cA('TOGGLE_INFIX')
};

const a = actions;
export default createReducer({
	[a.selectExp]: (state, payload) => ({
		...state,
		selectedExpId: payload.expr.id,
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
		nestingLimit: state.nestingLimit + 1,
		expandedExpIds: []
	}),
	[a.decNestingLimit]: (state, payload) => ({
		...state,
		nestingLimit: Math.max(0, state.nestingLimit - 1),
		expandedExpIds: []
	}),

	[a.expandExp]: (state, payload) => ({
			...state,
			expandedExpIds: [
				...state.expandedExpIds.slice(0, payload.expansionLevel),
				payload.expr.id
			],
			selectedExpId: payload.expr.id
	}),
	[a.collapseExp]: (state, payload) => ({
			...state,
			expandedExpIds: state.expandedExpIds.slice(0, payload),
			selectedExpId: null
	}),
	[a.toggleExpansion]: (state, payload) => {
		const shouldCollapse =
			state.expandedExpIds.length > payload.expansionLevel && state.expandedExpIds[payload.expansionLevel] ===
				payload.expr.id
		return {
			...state,
			selectedExpId: shouldCollapse ? null : payload.expr.id,
			expandedExpIds: shouldCollapse ?
				  state.expandedExpIds.slice(0, payload.expansionLevel)
				: [
					...state.expandedExpIds.slice(0, payload.expansionLevel),
					payload.expr.id
				]
		};
	},
	[a.toggleInfix]: state => ({
		...state, ignoreInfix: !state.ignoreInfix
	})
}, {
	selectedExpId: null,
	expandedExpIds: [],
	nestingLimit: 3,
	ignoreInfix: false
});
