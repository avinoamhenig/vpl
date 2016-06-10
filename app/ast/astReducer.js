import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import processAst from './processAst'
import replaceExpById from './replaceExpById'
import appendPieceToExp from './appendPieceToExp'
import removeExp from './removeExp'
import createExpression from './createExpression'
import { navigate } from 'lib/route-reducer'

import exampleFns from './examples/fns'
const initialState = processAst(exampleFns);

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
			return replaceExpById(state, exp, replaceId);
		} catch (e) {
			console.error(e);
			return state;
		}
	},
	[a.appendPieceToExp]: (state, expId) => {
		try {
			return appendPieceToExp(state, expId);
		} catch (e) {
			console.error(e);
			return state;
		}
	},
	[a.removeExp]: (state, expId) => {
		try {
			return removeExp(state, expId);
		} catch (e) {
			console.error(e);
			return state;
		}
	},
	[a.addFunctionDef]: (state, fnDef) => [...state, fnDef]
}, initialState);
