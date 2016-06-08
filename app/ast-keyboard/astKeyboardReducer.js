import { createAction as cA, createReducer } from 'redux-act'

export const actions = {
	toggleTextInput: cA('TOGGLE_TEXT_INPUT')
};

const a = actions;
export default createReducer({
	[a.toggleTextInput]: state => ({
		...state,
		showTextInput: !state.showTextInput
	})
}, {
	showTextInput: false
});
