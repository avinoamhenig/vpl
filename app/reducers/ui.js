import { createAction as cA, createReducer } from 'redux-act'

export const actions = {
	selectExp:       cA('select expression'),
	setNestingLimit: cA('set nesting limit'),
	setExpandedExp:  cA('set expanded expression id')
};

const a = actions;

export default createReducer({
	[a.selectExp]: (state, payload) =>
		({ ...state, selectedExpId: payload.id }),

	[a.setNestingLimit]: (state, payload) => ({
		...state,
		nestingLimit: Math.max(0, payload),
		expandedExpId: null
	}),

	[a.setExpandedExp]: (state, payload) =>
		({ ...state, expandedExpId: payload.id })
}, {
	selectedExpId: null,
	expandedExpId: null,
	nestingLimit: 3
});
