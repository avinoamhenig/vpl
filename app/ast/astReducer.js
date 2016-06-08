import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import processAst from './processAst'
import replaceExpById from './replaceExpById'

import exampleFns from './examples/fns'
const initialState = processAst(exampleFns);

const actions = {};
actions.replaceExp = cA('REPLACE_EXP', m('exp', 'replaceId'));
actions.replaceSelectedExp = exp => (dispatch, getState) => {
	dispatch(actions.replaceExp(exp, getState().lambdaView.selectedExpId));
}

export { actions };
const a = actions;

export default createReducer({

	[a.replaceExp]: (state, { exp, replaceId }) => {
		const replaced = replaceExpById(state, exp, replaceId);
		return replaced;
	}

}, initialState);
