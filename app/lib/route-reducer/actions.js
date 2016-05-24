import { createAction } from 'redux-actions'
import { NAVIGATE, REPLACE } from './action-types'

const navigate = createAction(NAVIGATE, href => href);
const replace = createAction(REPLACE, href => href);

export { navigate, replace }
