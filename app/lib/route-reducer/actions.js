import { NAVIGATE, REPLACE } from './action-types'

const navigate = (payload) => ({ type: NAVIGATE, payload });
const replace = (payload) => ({ type: REPLACE, payload });

export { navigate, replace }
