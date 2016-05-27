import { combineReducers } from 'redux'
import { routeReducer as route } from 'lib/route-reducer'
import ast from 'reducers/ast'
import ui from 'reducers/ui'

export default combineReducers({ route, ast, ui });
