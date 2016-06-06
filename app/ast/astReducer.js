import { createAction, createReducer } from 'redux-act'
import processAst from './processAst.js'

import sumAst from './examples/fns'
const initialState = processAst(sumAst);

export default createReducer({}, initialState);
