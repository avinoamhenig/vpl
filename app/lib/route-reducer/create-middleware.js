import { NAVIGATE, REPLACE } from './action-types'
import { navigate, replace } from './actions'

// IDEA ability to confirm navigation

export default history => store => {
	history.listen(l => {
		if (l.action !== 'POP') return;

		store.dispatch(navigate(l.pathname + l.search + l.hash));
	});

	return next => action => {
		switch (action.type) {
			case NAVIGATE:
				history.push(action.payload);
				return next(action);
			case REPLACE: // TODO replace action
			default:
				return next(action);
		}
	};
}
