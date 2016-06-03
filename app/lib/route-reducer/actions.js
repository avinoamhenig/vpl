import { NAVIGATE, REPLACE } from './action-types'

const encode = p => p.split('/').map(decodeURIComponent).map(encodeURIComponent).join('/');

const navigate = (payload) => ({
	type: NAVIGATE,
	payload: encode(payload)
});
const replace = (payload) => ({
	type: REPLACE,
	payload: encode(payload)
});

export { navigate, replace }
