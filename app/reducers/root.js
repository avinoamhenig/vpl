import { combineReducers } from 'redux'
import { routeReducer as route } from '../lib/route-reducer'
import ast from './ast'
import ui from './ui'

export default combineReducers({ route, ast, ui });
