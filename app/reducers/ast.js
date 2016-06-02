import { createAction, createReducer } from 'redux-act'
import processAst from 'lib/ast/processAst.js'

import sumAst from 'lib/ast/examples/fns'
const initialState = processAst(sumAst);

export default createReducer({}, initialState);
