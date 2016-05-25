import { createAction } from 'redux-actions'

let actionTypes =  {
	SELECT_EXP: '@@vpl/select-exp',
	SET_NESTING_LIMIT: '@@vpl/change-nesting-depth'
};
let actions = {
	selectExp: createAction(actionTypes.SELECT_EXP),
	setNestingLimit: createAction(actionTypes.SET_NESTING_LIMIT)
};
export { actionTypes, actions };
