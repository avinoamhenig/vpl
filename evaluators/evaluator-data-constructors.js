const {
	createNumberExpression,
	root,
	getAstType,
	getNodeOrExpType,
	getExpressionType,
	astType,
	nodeType,
	expressionType,
	getIdentifier,
	getIdentifiersScopedToNode,
	getNode,
	rootNode,
	createConstructionExpression
} = require('../app/ast');
const {
	basisFragment,
	identifiers,
	typeDefinitions,
	constructors,
	references
} = require('../app/basis');
const basis = require('../app/basis');


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
	const res = trampoline();
	return res;
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
		setTimeout(trampoline, 0);
	} else {
		console.log('done: ' + JSON.stringify(G.result));
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
			return call(callback, createNumberExpression(node.value));
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
			const identifier = getIdentifier(G.program, func.identifier);
			const index = G.builtInFunctions.indexOf(getIdentifier(G.program, func.identifier).displayName);
      if (index !== -1) {
        if (argVals.length === 2) {
          return call(evaluateStep, getNode(G.program, argVals[0]),
						function (x) {
	            return call(evaluateStep, getNode(G.program, argVals[1]),
								function (y) {
									const arg0 = rootNode(x).value;
									const arg1 = rootNode(y).value;
		              return call(callback, builtIn(identifier, arg0, arg1));
		            });
	          });
        } else if (argVals.length === 1) {
          return call(evaluateStep, getNode(G.program, argVals[0]),
						function(x) {
							const arg1 = x.value; //TODO: look at when null? is added back in
	            return call(callback, builtIn(index, x));
	          });
        } else {
					return call(callback, builtIn(identifier));
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
		case expressionType.CONSTRUCTION:
			const constructorID = node.constructor;
			const constructor = G.program.constructors[constructorID];
			if (node.parameters.length > 0) {
				return call(eval_star, node.parameters, 0,
					function (binding_vals) {
						return call(callback, createConstructionExpression(constructor, binding_vals));
					});
			} else {
				return call(callback, createConstructionExpression(constructor));
			}
    default:
      throw `Unexpected node: ${getNodeOrExpType(node)}.`;
  }
}

//For evaluating a list of arguments
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
				const cond = rootNode(condition).constructor;
				const t = basis.constructors["True"].id;
				if (cond === t) return call(evaluateStep, getNode(G.program, cs.expression), callback);
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
function builtIn(id, a1, a2) {
	switch (id.id) {
		case basis.identifiers.PLUS.id:
			return createNumberExpression(a1 + a2);
		case basis.identifiers.MINUS.id:
			return createNumberExpression(a1 - a2);
		case basis.identifiers.EQUAL.id:
		 var result = a1 === a2;
		 if (result) {
			 return createConstructionExpression(basis.constructors.True);
		 } else {
			 return createConstructionExpression(basis.constructors.False);
		 }
		case basis.identifiers.TIMES.id:
			return createNumberExpression(a1 * a2);
		case basis.identifiers.DIVIDE.id:
			return createNumberExpression(a1 / a2);
		case basis.identifiers.REMAINDER.id:
			return createNumberExpression(a1 % a2);
		case basis.identifiers.LESSTHAN.id:
			var result = a1 < a2;
			if (result) {
		 		return createConstructionExpression(basis.constructors.True);
	 		} else {
		 		return createConstructionExpression(basis.constructors.False);
	 		}
		 default:
		 	throw `Unexpected identifier ` + JSON.stringify(id);
	}
}

/*

function createBoolean(i, a1, a2) {
	var result;
	if (i === 6) result = (a1 === a2);
	else if (i === 7) result = (a1 != a2);
	else if (i === 8) result = (a1 < a2);
	else if (i === 9) result = (a1 > a2);
	else if (i === 10) result = (a1 <= a2);
	else if (i === 11) result =  (a1 >= a2);
	else if (i === 13) result = (a1.length === 0);
	else if (i === 14) result = (a1 === 0);
	if (result) {
		return createConstructionExpression(basis.constructors.True);
	} else {
		return createConstructionExpression(basis.constructors.False);
	}
}*/

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
	return i;
}

function onFail() {
  console.log("FAIL!");
}

module.exports = {evaluate, onCompletion, onFail};
