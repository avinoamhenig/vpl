import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import processAst from './processAst'
import replaceExpById from './replaceExpById'

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

export const actions = a;
export default createReducer({
	[a.replaceExp]: (state, { exp, replaceId }) => {
		const replaced = replaceExpById(state, exp, replaceId);
		return replaced;
	}
}, initialState);
