import { NAVIGATE, REPLACE } from './action-types'

const encode = p => p.split('/').map(decodeURIComponent).map(encodeURIComponent).join('/');

// TODO navigate with route desc, not url string
const navigate = (payload) => ({
	type: NAVIGATE,
	payload: encode(payload)
});
const replace = (payload) => ({
	type: REPLACE,
	payload: encode(payload)
});

export { navigate, replace }
