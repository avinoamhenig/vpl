import { createAction as cA, createReducer } from 'redux-act'

export const actions = {
	toggleTextInput: cA('TOGGLE_TEXT_INPUT'),
	toggleKeyboard: cA('TOGGLE_KEYBOARD'),
	toggleNameKeyboard: cA('TOGGLE_NAMING_KEYBOARD'),
	selectPane: cA('SELECT_KEYBOARD_PANE')
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
		show: !state.show,
		naming: false
	}),
	[a.toggleNameKeyboard]: state => ({
		...state,
		showTextInput: !state.showTextInput,
		naming: !state.naming
	}),
	[a.selectPane]: (state, index) => ({
		...state,
		selectedPane: index
	})
}, {
	showTextInput: false,
	show: true,
	naming: false,
	selectedPane: 0
});
