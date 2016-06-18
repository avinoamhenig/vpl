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
  setIdentifierScope
} = require('../app/ast');

var G = {};
G.tokens = [];
G.index = 0;
G.scope = [];

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

function parse() {
  while (hasNextToken()) {
    var token = getNextToken();
    if (token === '(') {
      if (peekNextToken() === 'define') {
        getNextToken();
        var name = getNextToken();
        const nameId = createIdentifier(name);
        var new_scope = {};
        new_scope[name] = nameId;
        G.scope.push(new_scope);
        var body = parse();
        G.scope.pop();
        var rootExp = createNumberExpression(0);
        return createProgram(bindIdentifier(rootExp, nameId, body));
      } else if (peekNextToken() === 'lambda') {
        getNextToken();
        getNextToken();
        var argIds = [];
        while (peekNextToken() !== ')') {
          var arg = getNextToken();
          console.log('argument: ' + arg );
          const argId = createIdentifier(arg);
          console.log(argId);
          var new_scope = {};
          new_scope[arg] = argId;
          G.scope.push(new_scope);
          console.log(JSON.stringify(G.scope[0]));
          argIds.push(argId);
        }
        getNextToken();
        var bodyFrag = parse();
        G.scope.pop();
        return createLambdaExpression(argIds, bodyFrag);
      } else if (peekNextToken() === '(') {
        var condFrag = parse();
        var expFrag = parse();
        if (getNextToken() === ")") {
          return createCaseBranch(condFrag, expFrag);
        }
      } else if (peekNextToken() === 'else') {
        getNextToken();
        return parse();
      } else if (peekNextToken() === 'cond') {
        getNextToken();
        let caseFrags = [];
        while (peekNextToken() !== ")") {
          caseFrags.push(parse());
        }
        getNextToken();
        var elseExpFrag = caseFrags[caseFrags.length-1];
        caseFrags = caseFrags.slice(0, caseFrags.length-1);
        return createCaseExpression(caseFrags, elseExpFrag);
      } else if (peekNextToken() === 'let') {
        getNextToken();
        getNextToken();
        var bindings = [];
        var names = [];
        var values = [];
        var new_bindings = {};
        while (peekNextToken() != ')') {
          getNextToken();
          var name = getNextToken();
          const nameId = createIdentifier(name);
          new_bindings[name] = nameId;
          var value = parse();
          names.push(nameId);
          values.push(value);
          getNextToken();
        }
        G.scope.push(new_bindings);
        getNextToken();
        var body = parse();
        G.scope.pop();
        for (var i = 0; i < names.length; i++) {
          names[i] = setIdentifierScope(names[i], body.rootNode);
          body = bindIdentifier(body, names[i], values[i]);
        }
        return body;
      } else {
        var lambdaFrag = parse();
        var argFrags = [];
        while (peekNextToken() !== ")") {
          argFrags.push(parse());
        }
        getNextToken();
        return createApplicationExpression(lambdaFrag, argFrags);
      }
    } else if (Number(token) || token === '0') {
      return createNumberExpression(Number(token));
    } else {
      if (lookup(token, G.scope)) {
        console.log('found token: ' +token);
        return createIdentifierExpression(getUID(token, G.scope));
      } else {
         console.log("undefined token: " + token);
         return;
      }
    }
  }
}

function peekNextToken() {
  return G.tokens[G.index];
}

function getNextToken() {
  G.index++;
  return G.tokens[G.index-1];
}

function hasNextToken() {
  return G.tokens.length > 0;
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

//this?
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
const remainder = createIdentifier('%');
built_in_env['%'] = remainder;
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
built_in_env['car'] = nil;
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

module.exports = {tokenize, reset, parse};
