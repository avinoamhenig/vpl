import { combineReducers } from 'redux'
import { routeReducer } from '../lib/route-reducer'
import astReducer from '../ast/ast-reducer.js'

export default combineReducers({
	route: routeReducer,
	ast: astReducer
});
