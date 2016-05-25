import { actionTypes, actions } from '../actions'

const uiReducer = (state = {}, action) => {
	switch (action.type) {
		case actionTypes.SELECT_EXP:
			return { ...state, selectedExpId: action.payload.id };
		default:
			return state;
	}
};

export default uiReducer;
