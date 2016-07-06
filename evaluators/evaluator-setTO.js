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

var G = {
  builtInFunctions: ['+', '-', '*', '/', 'div', 'remainder', '=', '!=', '<', '>', '<=', '>=', 'cons', 'null?', 'zero?', 'car', 'cdr', 'cddr', 'cadr', 'list'],
  environment: [],
  functions: {},
	counter: 0,
  procReg: null,
  args0: null,
  args1: null,
	args2: null,
	args3: null,
  notDone: {},
};

//Main
function evaluate(program, onComplete, onFail, limit=Number.MAX_SAFE_INTEGER) {
	setUp(program);
	G.program = program;
	G.LIMIT = limit;
	G.continue = true;
	G.fail = onFail;
  G.result = G.notDone;
	G.counter = 1;
	G.environment = [];
	G.InitialTime = Date.now();
	call(evaluateStep, root(program), onComplete);
	trampoline();
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

//Trampoline
function call(proc, arg0, arg1, arg2, arg3) {
  G.procReg = proc;
  G.args0 = arg0;
  G.args1 = arg1;
	G.args2 = arg2;
	G.args3 = arg3;
	G.result = G.notDone;
  return G.notDone
}

function trampoline() {
	while (G.result === G.notDone &&
				 G.counter % G.LIMIT !== 0) {
		G.result = G.procReg(G.args0, G.args1, G.args2, G.args3);
		G.counter++;
	}
	if (G.result === G.notDone) {
		G.counter++;
		console.log('timeout');
		setTimeout(trampoline, 0);
	} else {
		console.log('done: ' + G.result);
		return G.result;
	}
}

//Evaluate expression precursor (takes care of let bindings)
function evaluateStep(node, callback) {
  if (G.continue) {
		const boundIds = getIdentifiersScopedToNode(G.program, node.id).filter(id => id.value != null);
		if (boundIds.length > 0) {
			const binding_names = [];
			const boundExprs = [];
			for (var i = 0; i < boundIds.length; i++) {
				binding_names.push(boundIds[i].id);
				boundExprs.push(boundIds[i].value);
			}
			return call(eval_star, boundExprs, 0,
				function (binding_vals) {
					const new_env = extend(binding_names, binding_vals);
					G.environment.push(new_env);
					return call(evaluateBody, node,
						function (b) {
							G.environment.pop();
							return call(callback, b);
						});
				});
		} else {
			return call(evaluateBody, node, callback);
		}
	} else {
		G.fail();
	}
}

//Evaluate expression
function evaluateBody(node, callback) {
  switch (getNodeOrExpType(node)) {
    case expressionType.NUMBER:
			return call(callback, node.value);
    case expressionType.IDENTIFIER:
      const name = node.identifier;
      if (lookup(name, G.environment)) {
				return call(callback, getVariable(name, G.environment));
      } else {
				console.log("undefined identifier: " + name);
        G.continue = false;
        G.fail();
      }
      break;
    case expressionType.APPLICATION:
      const func = getNode(G.program, node.lambda);
      const argVals = node.arguments;
			const index = G.builtInFunctions.indexOf(getIdentifier(G.program, func.identifier).displayName);
      if (index !== -1) {
        if (argVals.length === 2) {
          return call(evaluateStep, getNode(G.program, argVals[0]),
						function (x) {
	            return call(evaluateStep, getNode(G.program, argVals[1]),
								function (y) {
		              return call(callback, builtIn(index, x, y));
		            });
	          });
        } else if (argVals.length === 1) {
          return call(evaluateStep, getNode(G.program, argVals[0]),
						function(x) {
	            return call(callback, builtIn(index, x));
	          });
        } else {
          return call(callback, []);
        }
      } else {
        if (!(func.identifier in G.functions)) {
          G.continue = false;
          G.fail();
        }
        const called_function = G.functions[func.identifier];
				const called_fun_args = called_function.arguments;
        return call(eval_star, argVals, 0,
					function (binding_vals) {
	          const new_env = extend(called_fun_args, binding_vals);
	          G.environment.push(new_env);
	          return call(evaluateStep, getNode(G.program, called_function.body),
							function (b) {
		            G.environment.pop();
		            return call(callback, b);
		          });
	        });
      }
      break;
    case expressionType.CASE:
      const cases = node.caseBranches;
			const elseBranch = getNode(G.program, node.elseBranch);
			return call(evaluate_cases, cases, callback, elseBranch, 0);
    default:
      throw `Unexpected node: ${getNodeOrExpType(node)}.`;
  }
}

function eval_star(exps, pos, callback) {
  if (pos === exps.length) {
    return call(callback, []);
  } else {
    return call(evaluateStep, getNode(G.program, exps[pos]),
			function (x) {
	      return call(eval_star, exps, pos+=1,
			    function (y) {
			      return call(callback, [x].concat(y));
			    });
		  });
  }
}

//For evaluating case statement's cases
function evaluate_cases(exps, callback, elseExp, pos) {
	if (pos === exps.length) {
		return call(evaluateStep, getNode(G.program, elseExp.expression), callback);
	} else {
		var cs = getNode(G.program, exps[pos]);
		return call(evaluateStep, getNode(G.program, cs.condition),
			function (condition) {
				if (condition) return call(evaluateStep, getNode(G.program, cs.expression), callback);
				else return call(evaluate_cases, exps, callback, elseExp, pos+=1);
			});
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
    else if (i === 18) return a1[a1.length-2];
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

// For Testing
function onCompletion(i) {
  G.elapsedTime = Date.now() - G.InitialTime;
	console.log("Success: " + JSON.stringify(i) + " Time: " + G.elapsedTime + " Counter: " + G.counter);
	return i;
}

function onFail() {
  console.log("FAIL!");
}

module.exports = {evaluate, onCompletion, onFail};
