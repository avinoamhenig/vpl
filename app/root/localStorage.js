const STORAGE_KEY = 'vpl4-iter2';

export const loadState = () => {
	if (typeof window === 'undefined') {
		return undefined;
	}
	try {
		const serializedState = localStorage.getItem(STORAGE_KEY);
		if (serializedState === null) {
			return undefined;
		}
		return JSON.parse(serializedState);
	} catch (e) {
		console.error(e);
		return undefined;
	}
};

export const saveState = state => {
	if (typeof window === 'undefined') {
		return;
	}
	try {
		const serializedState = JSON.stringify(state);
		localStorage.setItem(STORAGE_KEY, serializedState);
	} catch (e) {
		console.error(e);
	}
};
