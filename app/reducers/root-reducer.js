import { combineReducers } from 'redux'
import { routeReducer } from '../lib/route-reducer'
import astReducer from '../ast/ast-reducer.js'
import uiReducer from './ui-reducer.js'

export default combineReducers({
	route: routeReducer,
	ast: astReducer,
	ui: uiReducer
});
