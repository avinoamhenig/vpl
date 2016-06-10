import { createAction as cA, createReducer } from 'redux-act'

export const actions = {
	toggleTextInput: cA('TOGGLE_TEXT_INPUT'),
	toggleKeyboard: cA('TOGGLE_KEYBOARD')
};

const a = actions;
export default createReducer({
	[a.toggleTextInput]: state => ({
		...state,
		showTextInput: !state.showTextInput
	}),
	[a.toggleKeyboard]: state => ({
		...state,
		hidden: !state.hidden
	})
}, {
	showTextInput: false,
	hidden: true
});
