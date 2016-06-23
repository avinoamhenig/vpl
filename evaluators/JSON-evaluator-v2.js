const {
	root,
	getAstType,
	getNodeOrExpType,
	getExpressionType,
	astType,
	nodeType,
	expressionType,
	getIdentifier,
	getIdentifiersScopedToNode,
	getNode
} = require('../app/ast');

function onCompletion(i) {
  G.elapsedTime = Date.now() - G.InitialTime;
  console.log("Success: " + JSON.stringify(i));
}

function onFail() {
  console.log("FAIL!");
}

var G = {};

G.builtInFunctions = ['+', '-', '*', '/', 'div', 'remainder', '=', '!=', '<', '>', '<=', '>=', 'cons', 'null?', 'zero?', 'car', 'cdr', 'cddr', 'cadr', 'list'];
G.environment = [];
G.functions = {};
G.DELAY = 0;
G.fast = true;

function main(program, uponComplete, uponFail) {
  setUp(program);
  G.continue = true;
  G.environment = [];
  G.InitialTime = Date.now();
  evaluateStep(root(program), program, uponComplete, uponFail);
}

//Add "name id : lambda node" to G.functions
function setUp(program) {
  for (const identId of Object.keys(program.identifiers)) {
    const identifier = getIdentifier(program, identId);
    if (identifier.scope !== null || !identifier.value) {
      continue;
    }
    const valueExp = getNode(program, identifier.value);
    if (getExpressionType(valueExp) === expressionType.LAMBDA) {
      G.functions[identifier.id] = valueExp;
    }
  }
}

//Recursive or CPS style evaluation
function R(f, exp, program, callback, fail) {
  if (G.fast || exp.tag == "number" || exp.tag == "identifier") {
    return f(exp, program, callback, fail);
  } else {
    setTimeout(f, G.DELAY, exp, program, callback, fail);
  }
}

//Evaluate expression precursor (takes care of let bindings)
function evaluateStep(node, program, callback, fail) {
  if (G.continue) {
		const boundIds = getIdentifiersScopedToNode(program, node.id).filter(id => id.value != null);
		if (boundIds.length > 0) {
			const binding_names = [];
			const boundExprs = [];
			for (var i = 0; i < boundIds.length; i++) {
				binding_names.push(boundIds[i].id);
				boundExprs.push(boundIds[i].value);
			}
			eval_star(boundExprs, program,
				function (binding_vals) {
					const new_env = extend(binding_names, binding_vals);
					G.environment.push(new_env);
					R(evaluateBody, node, program,
						function (b) {
							G.environment.pop();
							callback(b);
						}, fail);
				});
		} else {
			evaluateBody(node, program, callback, fail);
		}
	} else {
		fail();
	}
}

//Evaluate expression
function evaluateBody(node, program, callback, fail) {
  switch (getNodeOrExpType(node)) {
    case expressionType.NUMBER:
      callback(node.value);
      break;
    case expressionType.IDENTIFIER:
      const name = node.identifier;
      if (lookup(name, G.environment)) {
        callback(getVariable(name, G.environment));
      } else {
				console.log("undefined identifier: " + name);
        G.continue = false;
        fail();
      }
      break;
    case expressionType.LAMBDA:
      evaluateStep(getNode(program, node.body), program, callback, fail);
      break;
    case expressionType.APPLICATION:
      const func = getNode(program, node.lambda);
      const argVals = node.arguments;
			const index = G.builtInFunctions.indexOf(getIdentifier(program, func.identifier).displayName);
      if (index !== -1) {
        if (argVals.length === 2) {
          R(evaluateStep, getNode(program, argVals[0]), program,
						function (x) {
	            R(evaluateStep, getNode(program, argVals[1]), program,
								function (y) {
		              callback(builtIn(index, x, y));
		            }, fail);
	          }, fail);
        } else if (argVals.length === 1) {
          R(evaluateStep, getNode(program, argVals[0]), program,
						function(x) {
	            callback(builtIn(index, x));
	          }, fail);
        } else {
          callback([]);
        }
      } else {
        if (!(func.identifier in G.functions)) {
          G.continue = false;
          fail();
        }
        const called_function = G.functions[func.identifier];
				const called_fun_args = called_function.arguments;
        eval_star(argVals, program,
					function (binding_vals) {
	          const new_env = extend(called_fun_args, binding_vals);
	          G.environment.push(new_env);
	          R(evaluateStep, getNode(program, called_function.body), program,
							function (b) {
		            G.environment.pop();
		            callback(b);
		          }, fail);
	        }, fail);
      }
      break;
    case expressionType.CASE:
      const cases = node.caseBranches;
			const elseBranch = getNode(program, node.elseBranch);
			evaluate_cases(cases, elseBranch, callback, program, fail);
      break;
    default:
      throw `Unexpected node: ${getNodeOrExpType(node)}.`;
  }
}

//For evaluating a list of arguments
function eval_star(exps, program, callback, fail) {
  if (exps.length === 0) {
    callback([]);
  } else {
    R(evaluateStep, getNode(program, exps[0]), program,
			function (x) {
	      eval_star(exps.slice(1, exps.length), program,
			    function (y) {
			      callback([x].concat(y));
			    }, fail);
		  }, fail);
  }
}

//For evaluating case statement's cases
function evaluate_cases(exps, elseExp, callback, program, fail) {
	if (exps.length === 0) {
		R(evaluateStep, getNode(program, elseExp.expression), program, callback, fail);
	} else {
		var cs = getNode(program, exps[0]);
		R(evaluateStep, getNode(program, cs.condition), program,
			function (condition) {
				if (condition) R(evaluateStep, getNode(program, cs.expression), program, callback, fail);
				else evaluate_cases(exps.slice(1, exps.length), elseExp, callback, program, fail);
			}, fail);
	}
}

// Environment Operations
function extend(new_syms, new_vals) {
  const new_env = {};
  for (var i = 0; i < new_syms.length; i++) {
    new_env[new_syms[i]] = new_vals[i];
  }
  return new_env;
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

// Built In Operations
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
    //"null?", "zero?", "car", "cdr", "cddr", "cadr", "list"
    if (i === 13) return a1.length === 0;
		else if (i === 14) return a1 === 0;
    else if (i === 15) return a1[a1.length-1];
    else if (i === 16) return a1.slice(0, a1.length-1);
    else if (i === 17) return a1.slice(0, a1.length-2);
    else if (i === 18) a1[a1.length-2];
		else return [a1];
  }
}

// Evaluation continue and speed methods
function stopEval() {
  G.continue = false;
}

function switchSpeed() {
  G.fast = !G.fast;
}

module.exports = {onCompletion, onFail, main, stopEval, switchSpeed};
