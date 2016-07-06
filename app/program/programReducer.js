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
	getIdentifier,
	wrapExpInDo
} from 'ast'
import { parseProgram } from '../../converters/parser-v2'

const initialState = require('../../test/ast/create_sum')();

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
a.wrapExpInDo = cA('WRAP_EXP_IN_DO');
a.wrapSelectedExpInDo = displayName => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		dispatch(a.wrapExpInDo(selectedExpId));
	}
};

export const actions = a;
export default createReducer({
	[a.replaceExp]: (ast, { exp, idToReplace }) => {
		try {
			return replaceNode(ast, idToReplace, exp);
		} catch (e) {
			console.error(e);
			return ast;
		}
	},
	[a.appendPieceToExp]: (ast, expId) => {
		return appendPieceToExp(ast, expId);
	},
	[a.removeExp]: (ast, expId) => {
		if (ast.nodes[expId] !== undefined) {
			return removeNode(ast, expId);
		} else if (ast.identifiers[expId] !== undefined) {
			return removeIdentifier(ast, expId);
		} else {
			throw `Unkown uid: ${expId}`;
		}
	},
	[a.addFunction]: (ast, { identifier, lambda }) => {
		return bindIdentifier(ast, identifier, lambda);
	},
	[a.loadSchemeProgram]: (ast, scheme) => {
		return scheme ? parseProgram(scheme) : ast;
	},
	[a.bindIdentifier]: (ast, { identifier, valueFrag, scope = null }) => {
		// if scoped to identifier, change scope to that identifier's scope
		if (ast.identifiers[scope]) {
			scope = getIdentifier(ast, scope).scope;
		}

		identifier = setIdentifierScope(identifier, scope);
		return bindIdentifier(ast, identifier, valueFrag);
	},
	[a.nameNode]: (ast, { nodeId, displayName }) =>
		setDisplayName(ast, nodeId, displayName),
	[a.wrapExpInDo]: (ast, expId) => wrapExpInDo(ast, expId)
}, initialState);
