import { createAction as cA, createReducer } from 'redux-act'
import m from 'lib/mapParamsToObject'
import {
	createIdentifier,
	createLambdaExpression,
	createNumberExpression,
	bindIdentifier,
	removeNode, replaceNode,
	appendPieceToExp,
	removeIdentifier,
	setIdentifierScope,
	setDisplayName,
	getIdentifier
} from 'ast'
import { parseProgram } from '../../converters/parser-v2'

const STORAGE_KEY = 'vpl_ast_v2_forest';
const save = newState => {
	if (typeof window === 'undefined') {
		return newState;
	}
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
	return newState;
};
let initialState = typeof window !== 'undefined'
	? window.localStorage.getItem(STORAGE_KEY) : null;
if (initialState === null) {
	initialState = require('../../test/ast/create_sum')();
	save(initialState);
} else {
	initialState = JSON.parse(initialState);
}

const a = {};
a.replaceExp = cA('REPLACE_EXP', m('exp', 'idToReplace'));
a.replaceSelectedExp = exp => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.replaceExp(exp, selectedExpId));
	}
};
a.appendPieceToExp = cA('APPEND_PIECE_TO_EXP');
a.appendPieceToSelectedExp = () => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.appendPieceToExp(selectedExpId));
	}
};
a.removeExp = cA('REMOVE_EXP');
a.removeSelectedExp = () => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.removeExp(selectedExpId));
	}
};
a.addFunction = cA('ADD_FUNCTION', m('identifier', 'lambda'));
a.newFunction = () => dispatch => {
	const arg = createIdentifier('x');
	const lambdaIdent = createIdentifier('f');
	const lambdaFrag = createLambdaExpression([arg],
		createNumberExpression(0)
	);
	dispatch(a.addFunction(lambdaIdent, lambdaFrag));
};
a.loadSchemeProgram = cA('LOAD_SCHEME_PROGRAM');
a.bindIdentifier = cA('BIND_IDENTIFIER', m('identifier', 'valueFrag', 'scope'));
a.addIdentifierToSelectedExp = name => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		const value = createNumberExpression(0);
		const ident = createIdentifier(name);
		dispatch(a.bindIdentifier(ident, value, selectedExpId));
	}
};
a.nameNode = cA('NAME_NODE', m('nodeId', 'displayName'));
a.nameSelectedNode = displayName => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.nameNode(selectedExpId, displayName));
	}
};

export const actions = a;
export default createReducer({
	[a.replaceExp]: (ast, { exp, idToReplace }) => {
		try {
			return save(replaceNode(ast, idToReplace, exp));
		} catch (e) {
			console.error(e);
			return ast;
		}
	},
	[a.appendPieceToExp]: (ast, expId) => {
		try {
			return save(appendPieceToExp(ast, expId));
		} catch (e) {
			console.error(e);
			return ast;
		}
	},
	[a.removeExp]: (ast, expId) => {
		if (ast.nodes[expId] !== undefined) {
			return save(removeNode(ast, expId));
		} else if (ast.identifiers[expId] !== undefined) {
			return save(removeIdentifier(ast, expId));
		} else {
			throw `Unkown uid: ${expId}`;
		}
	},
	[a.addFunction]: (ast, { identifier, lambda }) => {
		return save(bindIdentifier(ast, identifier, lambda));
	},
	[a.loadSchemeProgram]: (ast, scheme) => {
		return scheme ? save(parseProgram(scheme)) : ast;
	},
	[a.bindIdentifier]: (ast, { identifier, valueFrag, scope = null }) => {
		// if scoped to identifier, change scope to that identifier's scope
		if (ast.identifiers[scope]) {
			scope = getIdentifier(ast, scope).scope;
		}

		identifier = setIdentifierScope(identifier, scope);
		return save(bindIdentifier(ast, identifier, valueFrag));
	},
	[a.nameNode]: (ast, { nodeId, displayName }) =>
		save(setDisplayName(ast, nodeId, displayName))
}, initialState);
