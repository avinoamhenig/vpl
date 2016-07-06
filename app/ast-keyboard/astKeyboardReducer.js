import { createAction as cA, createReducer } from 'redux-act'

export const actions = {
	toggleTextInput: cA('TOGGLE_TEXT_INPUT'),
	toggleKeyboard: cA('TOGGLE_KEYBOARD'),
	toggleNameKeyboard: cA('TOGGLE_NAMING_KEYBOARD')
};

const a = actions;
export default createReducer({
	[a.toggleTextInput]: state => ({
		...state,
		showTextInput: !state.showTextInput,
		naming: false
	}),
	[a.toggleKeyboard]: state => ({
		...state,
		hidden: !state.hidden,
		naming: false
	}),
	[a.toggleNameKeyboard]: state => ({
		...state,
		showTextInput: !state.showTextInput,
		naming: !state.naming
	})
}, {
	showTextInput: false,
	hidden: false,
	naming: false
});
