import { combineReducers } from 'redux'
import { routeReducer as route } from 'lib/route-reducer'
import { astReducer as ast } from 'oldast'
import { lambdaViewReducer as lambdaView } from 'lambda-view'
import { astKeyboardReducer as astKeyboard } from 'ast-keyboard'
import { types as actionTypes } from 'redux-act';

// Clear action type cache so that redux-act doesn't throw
// when we re-create the action creators.
actionTypes.clear();

export default combineReducers({
	route, ast, lambdaView, astKeyboard
});
