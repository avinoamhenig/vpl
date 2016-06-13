import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import processAst from './processAst'
import replaceExpById from './replaceExpById'
import appendPieceToExp from './appendPieceToExp'
import removeExp from './removeExp'
import createExpression from './createExpression'
import { navigate } from 'lib/route-reducer'

import exampleFns from './examples/fns'
const STORAGE_KEY = 'vpl_ast_forest';
const save = newState => {
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
	return newState
};
let initialState = window.localStorage.getItem(STORAGE_KEY);
if (initialState === null) {
	initialState = processAst(exampleFns);
	save(initialState);
} else {
	initialState = JSON.parse(initialState);
}

const a = {};
a.replaceExp = cA('REPLACE_EXP', m('exp', 'replaceId'));
a.replaceSelectedExp = exp => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.replaceExp(exp, selectedExpId));
	}
};
a.appendPieceToExp = cA('APPEND_PIECE_TO_EXP');
a.appendPieceToSelectedExp = () => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.appendPieceToExp(selectedExpId));
	}
};
a.removeExp = cA('REMOVE_EXP');
a.removeSelectedExp = () => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.removeExp(selectedExpId));
	}
};
a.addFunctionDef = cA('ADD_FUNCTION_DEF');
a.newFunction = () => dispatch => {
	const fn = createExpression('__--function_def--__');
	dispatch(a.addFunctionDef(fn));
};

export const actions = a;
export default createReducer({
	[a.replaceExp]: (state, { exp, replaceId }) => {
		try {
			return save(replaceExpById(state, exp, replaceId));
		} catch (e) {
			console.error(e);
			return state;
		}
	},
	[a.appendPieceToExp]: (state, expId) => {
		try {
			return save(appendPieceToExp(state, expId));
		} catch (e) {
			console.error(e);
			return state;
		}
	},
	[a.removeExp]: (state, expId) => {
		try {
			return save(removeExp(state, expId));
		} catch (e) {
			console.error(e);
			return state;
		}
	},
	[a.addFunctionDef]: (state, fnDef) => save([...state, fnDef])
}, initialState);
