import { createAction, createReducer } from 'redux-act'
import processAst from '../ast/processAst.js'

import sumAst from '../ast/examples/sum'
const initialState = processAst(sumAst);

export default createReducer({}, initialState);
