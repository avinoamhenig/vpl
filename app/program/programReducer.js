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
	wrapExpInDo,
	setType,
	createTypeVariable,
	createTypeInstance,
	attachTypeDefinitions,
	getBasisEntity,
	createDefaultExpression,
	tCreateDefaultExpression,
	tCreateIdentifier,
	tCreateLambdaExpression,
	executeInsert,
	getEntity
} from 'ast'
import { parseProgram } from '../../converters/parser-v2'

const initialState = require('./createInitialState').default();

const a = {};
a.replaceAst = cA('REPLACE_AST', m('newProgram', 'idReplaced', 'replacementId'));
a.replaceSelectedExp = (nodeType, valueish) => (dispatch, getState) => {
	const { program } = getState();
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		const {
			newProgram,
			replacementId
		} = executeInsert(program, nodeType, valueish, selectedExpId);
		dispatch(a.replaceAst(newProgram, selectedExpId, replacementId));
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
a.newFunction = () => (dispatch, getState) => {
	const { program } = getState();
	const lambdaIdent = createIdentifier('f');
	const lambdaFrag = tCreateLambdaExpression(
		program,
		tCreateIdentifier('x'),
		tCreateDefaultExpression()
	);
	dispatch(a.addFunction(lambdaIdent, lambdaFrag));
};
a.loadSchemeProgram = cA('LOAD_SCHEME_PROGRAM');
a.loadJSONProgram = cA('LOAD_JSON_PROGRAM');
a.bindIdentifier = cA('BIND_IDENTIFIER', m('identifier', 'scope'));
a.addIdentifierToSelectedExp = name => (dispatch, getState) => {
	const { selectedExpId } = getState().lambdaView;
	if (selectedExpId) {
		const ident = createIdentifier(name);
		dispatch(a.bindIdentifier(ident, selectedExpId));
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
	[a.replaceAst]: (ast, { newProgram }) => {
		return newProgram;
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
	[a.loadJSONProgram]: (ast, newJson) => {
		return newJson ? JSON.parse(newJson) : ast;
	},
	[a.bindIdentifier]: (ast, { identifier, scope = null }) => {
		// if scoped to identifier, change scope to that identifier's scope
		if (ast.identifiers[scope]) {
			scope = getIdentifier(ast, scope).scope;
		}

		const tVar = createTypeVariable();
		const type = createTypeInstance(tVar.id);
		identifier = setIdentifierScope(identifier, scope);
		return attachTypeDefinitions(
			setType(
				bindIdentifier(ast, identifier, setType(
					createDefaultExpression(),
					type
				)),
				identifier.id,
				type
			),
			[], [], [tVar]
		);
	},
	[a.nameNode]: (ast, { nodeId, displayName }) =>
		setDisplayName(ast, nodeId, displayName),
	[a.wrapExpInDo]: (ast, expId) => wrapExpInDo(ast, expId)
}, initialState);
