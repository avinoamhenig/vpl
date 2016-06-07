import { combineReducers } from 'redux'
import { routeReducer as route } from 'lib/route-reducer'
import { astReducer as ast } from 'ast'
import { lambdaViewReducer as lambdaView } from 'lambda-view'

export default combineReducers({ route, ast, lambdaView });
