import { actionTypes, actions } from '../actions'

const defaultUiState = {
	selectedExpId: null,
	nestingLimit: 3
};

const uiReducer = (state = defaultUiState, action) => {
	switch (action.type) {
		case actionTypes.SELECT_EXP:
			return { ...state, selectedExpId: action.payload.id };
		case actionTypes.SET_NESTING_LIMIT:
			// TODO we should not be able to set the nesting limit to be
			// greater than the maximum depth of our program.
			return { ...state, nestingLimit: Math.max(0, action.payload) }
		default:
			return state;
	}
};

export default uiReducer;
