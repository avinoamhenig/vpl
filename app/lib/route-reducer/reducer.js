import { NAVIGATE, REPLACE } from './action-types'

const routeReducer = (state = { current: '/', previous: null }, action) => {
	switch (action.type) {
		case NAVIGATE:
			return { current: action.payload, previous: state.current };
		case REPLACE:
			return { current: action.payload, previous: state.previous };
		default:
			return state;
	}
};

export { routeReducer }
