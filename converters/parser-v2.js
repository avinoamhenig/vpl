const basis = require('../app/basis');

const {
	createProgram,
	createIdentifier,
	createNumberExpression,
	createIdentifierExpression,
	createLambdaExpression,
	createApplicationExpression,
	createCaseExpression,
	createCaseBranch,
	createDeconstructionExpression,
	createDeconstructionCase,
	createDoExpression,
	bindIdentifier,
  bindIdentifiers,
  setIdentifierScope
} = require('../app/ast');

var G = {};
G.tokens = [];
G.index = 0;
G.scope = [];

function parseProgram(program) {
	setUpBuiltInEnvironment();
  tokenize(program);
	makeFunctionIds();
  const idFrags = [];
  while (lookAhead(1) === 'define') {
    eat(getNextToken(), '(');
    eat(getNextToken(), 'define');
    const idFrag = parseDefine();
    idFrags.push(idFrag);
    // build up array of [[ident, val],...]
  }
  var rootExp = parseExp();
  reset();
  return createProgram(bindIdentifiers(rootExp, idFrags));
}

function makeFunctionIds() {
	const function_ids = {};
	for (var i = 0; i < G.tokens.length; i++) {
		if (G.tokens[i] === 'define') {
			const func_name = G.tokens[i+1];
			const id = createIdentifier(func_name);
			function_ids[func_name] = id;
		}
	}
	G.scope.push(function_ids);
}

function parseDefine() {
  const name = getNextToken();
	var nameId = getUID(name, G.scope);
  const new_scope = {};
  new_scope[name] = nameId;
  G.scope.push(new_scope);
  const body = parseExp();
  eat(getNextToken(), ')');
  return [nameId, body];
}

function parseExp() {
  var token = getNextToken();
  if (token === '(') {
    if (peekNextToken() === 'lambda') {
      eat(getNextToken(), 'lambda');
      eat(getNextToken('('));
      const argIds = [];
      var new_scope = {};
      while (peekNextToken() !== ')') {
        const arg = getNextToken();
        const argId = createIdentifier(arg);
        new_scope[arg] = argId;
        argIds.push(argId);
      }
      G.scope.push(new_scope);
      eat(getNextToken(), ')');
      const bodyFrag = parseExp();
      eat(getNextToken(), ')');
      G.scope.pop();
      return createLambdaExpression(argIds, bodyFrag);
    } else if (peekNextToken() === 'cond') {
      eat(getNextToken(), 'cond');
      var caseFrags = [];
      while (peekNextToken() !== ')') {
        eat(getNextToken(), '(');
        caseFrags.push(parseCase());
      }
      eat(getNextToken(), ')');
      var elseExpFrag = caseFrags[caseFrags.length-1];
      caseFrags = caseFrags.slice(0, caseFrags.length-1);
      return createCaseExpression(caseFrags, elseExpFrag);

		} else if (peekNextToken() === 'DO') {
				getNextToken();
				const exps = [];
				while (peekNextToken() !== ')') {
					exps.push(parseExp());
				}
				getNextToken();
				if (exps.length > 0) {
					const retExp = exps.pop();
					return createDoExpression(exps, retExp);
				} else {
					throw 'empty DO list';
				}

		} else if (peekNextToken() === 'MATCH') {
				getNextToken();
				const target = parseExp();
				const matchFrags = [];
				while (peekNextToken() !== ')') {
					eat(getNextToken(), '(');
					matchFrags.push(parseMatchCase());
					eat(getNextToken(), ')');
				}
				eat(getNextToken(), ')');
				return createDeconstructionExpression(target, matchFrags);

    } else if (peekNextToken() === 'let') {
      eat(getNextToken(), 'let');
      eat(getNextToken(), '(');
      const[bindings, names, values] = [[],[],[]];
      const new_bindings = {};
      while (peekNextToken() != ')') {
        eat(getNextToken(), '(');
        const name = getNextToken();
        const nameId = createIdentifier(name);
        new_bindings[name] = nameId;
        const value = parseExp();
        names.push(nameId);
        values.push(value);
        eat(getNextToken(), ')');
      }
      G.scope.push(new_bindings);
      eat(getNextToken(), ')')
      var body = parseExp();
      G.scope.pop();
      for (var i = 0; i < names.length; i++) {
        names[i] = setIdentifierScope(names[i], body.rootNode);
        body = bindIdentifier(body, names[i], values[i]);
      }
			eat(getNextToken(), ')');
      return body;
    } else {
      const lambdaFrag = parseExp();
      const argFrags = [];
      while (peekNextToken() != ')') {
        argFrags.push(parseExp());
      }
      eat(getNextToken(), ')');
      return createApplicationExpression(lambdaFrag, argFrags);
    }
  } else if (Number(token) || token === '0') {
    return createNumberExpression(Number(token));
  } else {
    if (lookup(token, G.scope)) {
      return createIdentifierExpression(getUID(token, G.scope));
    } else {
			console.log("Undefined token: " + token);
    }
  }
}

function parseCase() {
  if (peekNextToken() === '(') {
    const condFrag = parseExp();
    const expFrag = parseExp();
    if (eat(getNextToken(), ')')) {
      return createCaseBranch(condFrag, expFrag);
    }
  } else {
    eat(getNextToken(), 'else');
    const elseExp = parseExp();
    eat(getNextToken(), ')');
    return elseExp;
  }
}

function parseMatchCase() {
  eat(getNextToken(), '(');
	const constructorName = getNextToken();
	const constructor = constructorMap[constructorName];
	if (constructor) {
		const constructParams = [];
		const newScope = {};
		while (peekNextToken() !== ')') {
			const paramName = getNextToken();
			const paramId = createIdentifier(paramName);
			constructParams.push(paramId);
			newScope[paramName] = paramId;
		}
		getNextToken();
		G.scope.push(newScope);
		const action = parseExp();
		G.scope.pop();
		return createDeconstructionCase(constructor, constructParams, action);
	} else {
		throw 'undefined constructor: ' + constructorName;
	}
}

const constructorMap = {
	'NIL' : basis.constructors.End,
	'CONS' : basis.constructors.List
};


function reset() {
  G.index = 0;
  G.tokens = [];
  G.scope= [];
}

function getTokens() {
	return JSON.stringify(G.scope);
}

//Token Operations
function tokenize(exp) {
	exp = exp.replace(/;.*$/gm, '');
	exp = exp.replace(/\n/g, ' ');
	exp = exp.replace(/[\)]/g, " ) ");
  exp = exp.replace(/[\(]/g, " ( ");
  exp = exp.trim();
  G.tokens = exp.split(/\s+/);
}

function eat(token, expectedToken) {
  return token === expectedToken; // eh?
}

function peekNextToken() {
  return G.tokens[G.index];
}

function getNextToken() {
  G.index++;
  return G.tokens[G.index-1];
}

function lookAhead(i) {
  return G.tokens[G.index+i];
}

//Environment Operations
function lookup(sym, env) {
  if (env.length === 0) {
    return false;
  } else if (env.length === 1) {
    return (sym in env[0]);
  } else {
    return (sym in env[env.length-1]) || lookup(sym, env.slice(0,env.length-1));
  }
}

function getUID(sym, env) {
  if (sym in env[env.length-1]) {
    return env[env.length-1][sym];
  } else {
    return getUID(sym, env.slice(0,env.length-1));
  }
}

//Set up built in environment
function setUpBuiltInEnvironment() {
	const built_in_env = {
		'+': basis.identifiers[basis.references.PLUS],
		'-': basis.identifiers[basis.references.MINUS],
		'=': basis.identifiers[basis.references.EQUAL],
		'<': createIdentifier('<'),
		'/': createIdentifier('/'),
		list: createIdentifier('list'),
		draw: createIdentifier('draw'),
		turn: createIdentifier('turn'),
	};
	G.scope.push(built_in_env);
}

module.exports = {parseProgram, reset, getTokens};
