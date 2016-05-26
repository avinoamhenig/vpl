import { createAction, createReducer } from 'redux-act'

export const actions = {
	selectExp: createAction('select expression'),
	setNestingLimit: createAction()
};

export default createReducer({
	[actions.selectExp]: (state, payload) =>
		({ ...state, selectedExpId: payload.id }),

	[actions.setNestingLimit]: (state, payload) =>
		({ ...state, nestingLimit: Math.max(0, payload) })
}, {
	selectedExpId: null,
	nestingLimit: 3
});
