import { createAction as cA, createReducer } from 'redux-act'

export const actions = {
	selectExp: cA('select expression',
		(expr, expansionLevel) => ({ expr, expansionLevel })),
	setNestingLimit: cA('set nesting limit'),
	increaseNestingLimit: cA('increment nesting limit'),
	decreaseNestingLimit: cA('decrement nesting limit'),
	expandExp: cA('expand expression',
		(expr, expansionLevel) => ({ expr, expansionLevel })),
	collapseExpansion: cA('collapse expansion level'),
	toggleExpansion: cA('toggle expression expansion',
		(expr, expansionLevel) => ({ expr, expansionLevel })),
	toggleInfix: cA('toggle infix')
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
	[a.increaseNestingLimit]: (state, payload) => ({
		...state,
		nestingLimit: state.nestingLimit + 1,
		expandedExpIds: []
	}),
	[a.decreaseNestingLimit]: (state, payload) => ({
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
