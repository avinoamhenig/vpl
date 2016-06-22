const {
	createProgram,
	createIdentifier,
	createNumberExpression,
	createIdentifierExpression,
	createLambdaExpression,
	createApplicationExpression,
	createCaseExpression,
	createCaseBranch,
	bindIdentifier,
  bindIdentifiers,
  setIdentifierScope
} = require('../app/ast');

var G = {};
G.tokens = [];
G.index = 0;
G.scope = [];

function parseProgram(program) {
  tokenize(program);
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

function parseDefine() {
  const name = getNextToken();
  const nameId = createIdentifier(name);
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

function tokenize(exp) {
  exp = exp.replace(/[\)]/g, " ) ");
  exp = exp.replace(/[\(]/g, " ( ");
  exp = exp.trim();
  G.tokens = exp.split(/\s+/);
}

function reset() {
  G.index = 0;
  G.tokens = [];
  G.parsed_program = [];
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


var built_in_env = {};

const plus = createIdentifier('+');
built_in_env['+'] = plus;
const minus = createIdentifier('-');
built_in_env['-'] = minus;
const times = createIdentifier('*');
built_in_env['*'] = times;
const divide = createIdentifier('/');
built_in_env['/'] = divide;
const div = createIdentifier('div');
built_in_env['div'] = div;
const remainder = createIdentifier('remainder');
built_in_env['remainder'] = remainder;
const eq = createIdentifier('=');
built_in_env['='] = eq;
const neq = createIdentifier('!=');
built_in_env['!='] = neq;
const lt = createIdentifier('<');
built_in_env['<'] = lt;
const gt = createIdentifier('>');
built_in_env['>'] = gt;
const lte = createIdentifier('<=');
built_in_env['<='] = lte;
const gte = createIdentifier('>=');
built_in_env['>='] = gte;
const cons = createIdentifier('cons');
built_in_env['cons'] = cons;
const nil = createIdentifier('null?');
built_in_env['null?'] = nil;
const zero = createIdentifier('zero?');
built_in_env['zero?'] = zero;
const car = createIdentifier('car');
built_in_env['car'] = car;
const cdr = createIdentifier('cdr');
built_in_env['cdr'] = cdr;
const cddr = createIdentifier('cddr');
built_in_env['cddr'] = cddr;
const cadr = createIdentifier('cadr');
built_in_env['cadr'] = cadr;
const list = createIdentifier('list');
built_in_env['list'] = list;

G.scope.push(built_in_env);

module.exports = {parseProgram};
