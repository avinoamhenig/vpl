import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import {
	createIdentifier,
	createLambdaExpression,
	createNumberExpression,
	bindIdentifier
} from 'ast'

const STORAGE_KEY = 'vpl_ast_v2_forest';
const save = newState => {
	if (typeof window === 'undefined') {
		return newState;
	}
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
	return newState;
};
let initialState = typeof window !== 'undefined'
	? window.localStorage.getItem(STORAGE_KEY) : null;
if (initialState === null) {
	initialState = require('../../test/ast/create_sum')();
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
a.addFunction = cA('ADD_FUNCTION', m('identifier', 'lambda'));
a.newFunction = () => dispatch => {
	const arg = createIdentifier('x');
	const lambdaIdent = createIdentifier('f');
	const lambdaFrag = createLambdaExpression([arg],
		createNumberExpression(0)
	);
	dispatch(a.addFunction(lambdaIdent, lambdaFrag));
};

export const actions = a;
export default createReducer({
	[a.replaceExp]: (ast, { exp, replaceId }) => {
		// TODO replaceExp
		console.error('replaceExp not implemented');
		return state;
	},
	[a.appendPieceToExp]: (ast, expId) => {
		// TODO appendPieceToExp
		console.error('appendPieceToExp not implemented');
		return ast;
	},
	[a.removeExp]: (state, expId) => {
		// TODO appendPieceToExp
		console.error('appendPieceToExp not implemented');
		return ast;
	},
	[a.addFunction]: (ast, { identifier, lambda }) => {
		return save(bindIdentifier(ast, identifier, lambda));
	}
}, initialState);