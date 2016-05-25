import { createAction } from 'redux-actions'

const
	SELECT_EXP = '@@vpl/select-exp';

let actionTypes =  { SELECT_EXP };
let actions = {
	selectExp: createAction(SELECT_EXP)
};
export { actionTypes, actions };
