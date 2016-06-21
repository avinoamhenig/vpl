const {
	root,
	getAstType, getNodeOrExpType, getExpressionType,
	astType, nodeType, expressionType,
	getIdentifier, getNode
} = require('../app/ast');

function uponComplete(i) {
  G.elapsedTime = Date.now() = G.InitialTime;
  console.log("Success: " + JSON.stringify(i));
}

function uponFail() {
  console.log("FAIL!");
}

var G = {};

//G.fun_def_dicts = [];
G.builtInFunctions = ['+', '-', '*', '/', 'div', '%', '=', '!=','<', '>', '<=', '>=', 'cons', 'null?', 'car', 'cdr', 'cddr', 'cadr', 'list'];
G.environment = [];
G.functions = {};
G.DELAY = 0;
G.fast = false;

function setUp(program) {
  console.log("this the program " + program);
  for (const identId of Object.keys(program.identifiers)) {
    const identifier = getIdentifier(program, identId);
    if (identifier.scope !== null || identifier.value) {
      continue;
    }
    const valueExp = getNode(program, identifier.value);
    if (getExpressionType(valueExp) === expressiontype.LAMBDA) {
      G.functions[identifier] = valueExp;
    }
  }
}

function main(program, uponComplete, uponFail) {
  setUp(program);
  G.continue = true;
  G.environment = [];
  G.InitialTime = Date.now();
  evaluateStep(root(program), uponComplete, uponFail);
}

function R(f, exp, program, callback, fail) {
  if (G.fast || exp.tag == "number" || exp.tag == "identifier") {
    return f(exp, program, callback, fail);
  } else {
    setTimeout(f, G.DELAY, exp, program, callback, fail);
  }
}

function evaluateStep(node, program, callback, uponFail) {
  if (G.continue) {
    switch (getNodeOrExpType(node)) {
      case expressionType.NUMBER:
        callback(node.value);
        break //?
      case expressionType.IDENTIFIER:
        const name = getIdentifier(program, node.identifier);
        if (lookup(name, G.environment)) {
          callback(getVariable(name, G.environment));
        } else {
          G.continue = false;
          uponFail();
        }
        break;
      case expressionType.LAMBDA:
        evaluateStep(getNode(program, node.body), program, callback, uponFail);
        //arguments and a body
        //presumably the arguments have been bound
        //just have to evaluate the body
        break;
      case expressionType.APPLICATION:
        const func = getNode(program, node.lambda);
        const argVals = node.arguments; //map them or something?
        if (builtInFunctions.indexOf(func.id) !== -1) {
          if (argVals.length === 2) {
            R(evaluateStep, argVals[0], function (x) {
              R(evaluateStep, argVals[1], program, function (y) {
                callback(builtIn(builtInFunctions.indexOf(func.id), x, y));
              }, uponFail);
            }, uponFail);
          } else if (argVals.length === 1) {
          R(evaluateStep, argVals[0], program, function(x) {
            callback(builtIn(builtInFunctions.indexOf(func.id), x));
          }, uponFail);
        } else {
          callback([]);
        }
      } else {
        if (G.functions.indexOf(func.id) === -1){
          G.continue = false;
          console.log("Undefined identifier: " + func.id);
          uponFail();
        }
        const called_function = G.functions[func.name]; // this gives you a node, valueExp
        const called_fun_args = called_function.arguments;
        eval_star(argVals, function (binding_vals) {
          const new_env = extend(called_fun_args, binding_vals);
          G.environment.push(new_env);
          R(evaluateStep, getNode(called_function.lambda), program, function (b) {
            G.environment.pop();
            callback(b);
          }, uponFail);
        });
      }
      break;
          //arguments and a lambda
      case expressionType.CASE:
        const cases = node.caseBranches;
        evaluate_cases(cases, node.elseBranch, callback);
        function evaluate_cases(exps, elseExp, callback) {
          if (exps.length === 0) {
            R(evaluateStep, getNode(elseExp).expression, program, callback, uponFail);
          } else {
            R(evaluateStep, getNode(exps[0]).condition, program, function (condition) {
              if (condition) R(evaluateStep, getNode(exps[0]).expression, program, callback, uponFail);
              else evaluate_cases(exps.slice(1, exps.length), elseExp, callback);
            }, uponFail);
          }
        }
        break;
        //caseBranches, elseBranch
      default:
        throw `Unexpected node: ${getNodeorExpType(node)}.`;
    }
  } else {
    uponFail();
  }
}

function extend(new_syms, new_vals) {
  const new_env = {};
  for (var i = 0; i < new_syms.length; i++) {
    new_env[new_syms[i]] = new_vals[i];
  }
  return new_env;
}

//some getNodes
function eval_star(exps, callback) {
  if (exps.length === 0) {
    callback([]);
  } else {
    R(evaluateStep, exps[0],
    function (x) {
      eval_star(exps.slice(1, exps.length),
    function (y) {
      callback([x].concat(y));
    });
  }, uponFail);
  }
}

function lookup(val, env) {
  if (env.length === 0) {
    return false;
  } else if (env.length === 1) {
    return (val in env[0]);
  } else {
    return (val in env[env.length-1]) || lookup(val, env.slice(0,env.length-1));
  }
}

function getVariable(val, env) {
  if (val in env[env.length-1]) {
    return env[env.length-1][val];
  } else {
    return getVariable(val, env.slice(0,env.length-1));
  }
}

function builtIn(i, a1, a2) {
  if (arguments.length === 3) {
    if (i === 0) return a1 + a2;
    else if (i === 1) return a1 - a2;
    else if (i === 2) return a1 * a2;
    else if (i === 3) return a1 / a2;
    else if (i === 4) return Math.floor(a1/a2);
    else if (i === 5) return a1 % a2;
    else if (i === 6) return a1 === a2;
    else if (i === 7) return a1 != a2;
    else if (i === 8) return a1 < a2;
    else if (i === 9) return a1 > a2;
    else if (i === 10) return a1 <= a2;
    else if (i === 11) return a1 >= a2;
    else { return a2.concat([a1]);};
  } else if (arguments.length === 2) {
    //"null?", "car", "cdr", "cddr", "cadr"
    if (i === 13) return a1.length === 0;
    else if (i === 14) return a1[a1.length-1];
    else if (i === 15) return a1.slice(0, a1.length-1);
    else if (i === 16) return a1.slice(0, a1.length-2);
    else return a1[a1.length-2];
  }
}

function stopEval() {
  G.continue = false;
}

function switchSpeed() {
  G.fast = !G.fast;
}

function displayEnv() {
  console.log("Current Environment:")
  for (var i = 0; i < G.environment.length; i++) {
    console.log(i + ": " + JSON.stringify(G.environment[i]));
  }
}

module.exports = {main};
