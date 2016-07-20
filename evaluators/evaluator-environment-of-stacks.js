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
	createConstructionExpression,
	extractFragment,
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
  environment: {},
  functions: {},
	counter: 0,
  procReg: null,
  args0: null,
  args1: null,
	args2: null,
	args3: null,
	args4: null,
	args5: null,
  notDone: {},
};

//Main
function evaluate(program, onComplete, onFail, draw, move, turn, limit=Number.MAX_SAFE_INTEGER) {
	G.program = program;
	G.fail = onFail;
	G.draw = draw;
	G.move = move;
	G.turn = turn;
	G.LIMIT = limit;
	G.continue = true;
  G.result = G.notDone;
	G.counter = 1;
	G.environment = {};
	setUp(program);
	G.InitialTime = Date.now();
	call(evaluateStep, root(program), onComplete);
	const res = trampoline();
	console.log("TIME: " + G.elapsedTime);
	return res;
}

//Add "name id : lambda node" to G.functions
function setUp(program) {
	const ids = [];
	const push_vals = [];
  for (const identId of Object.keys(program.identifiers)) {
    const identifier = getIdentifier(program, identId);
    if (identifier.scope !== null || !identifier.value) {
      continue;
    }
		ids.push(identifier.id);
		push_vals.push(extractFragment(program, identifier.value));
  }
	pushEnvironment(ids, push_vals);
}

//Trampoline
function call(proc, arg0, arg1, arg2, arg3, arg4, arg5) {
  G.procReg = proc;
  G.args0 = arg0;
  G.args1 = arg1;
	G.args2 = arg2;
	G.args3 = arg3;
	G.args4 = arg4;
	G.args5 = arg5;
	G.result = G.notDone;
  return G.notDone
}

function trampoline() {
	while (G.result === G.notDone &&
				 G.counter % G.LIMIT !== 0) {
		G.result = G.procReg(G.args0, G.args1, G.args2, G.args3, G.args4, G.args5);
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
			const bound_expressions = boundExprs.map(i => getNode(G.program, i));
			return call(eval_star, bound_expressions, 0,
				function (binding_vals) {
					pushEnvironment(binding_names, binding_vals);
					return call(evaluateBody, node,
						function (b) {
							popEnvironment(binding_names);
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
			const variable = lookup(name, G.environment);
      if (variable) {
				return call(callback, variable);
      } else {
        G.continue = false;
        G.fail();
      }
      break;

    case expressionType.APPLICATION:
      const func = getNode(G.program, node.lambda);
			return call(evaluateStep, func, function(eval_func) {
			//	const argVals = node.arguments;
				const argVals = node.arguments.map(i => getNode(G.program, i));
				if (getExpressionType(rootNode(eval_func)) === expressionType.BUILT_IN_FUNCTION) {
					return evaluateBuiltInFunction(argVals, eval_func, callback);
				} else {
					if (getExpressionType(rootNode(eval_func)) !== expressionType.LAMBDA) {
						G.continue = false;
						G.fail();
					}
					return eval_application(argVals, eval_func, callback);
				}
			});

    case expressionType.CASE:
      const cases = node.caseBranches;
			const elseBranch = getNode(G.program, node.elseBranch);
			return call(evaluate_cases, cases, callback, elseBranch, 0);

		case expressionType.CONSTRUCTION:
			const constructorID = node.constructor;
			const constructor = G.program.constructors[constructorID];
			if (node.parameters.length > 0) {
				const node_params = node.parameters.map(i => getNode(G.program, i));
				return call(eval_star, node_params, 0,
					function (binding_vals) {
						return call(callback, createConstructionExpression(constructor, binding_vals));
					});
			} else {
				return call(callback, createConstructionExpression(constructor));
			}

		case expressionType.DECONSTRUCTION:
			const deconstruction_cases = node.cases;
			return call(evaluateStep, getNode(G.program, node.dataExpression),
				function (data_exp) {
					return call(evaluate_deconstruction, data_exp, deconstruction_cases, callback);
				});

		case expressionType.DO:
		//	const unitExpressions = node.unitExpressions;
			const unitExpressions = node.unitExpressions.map(i => getNode(G.program, i));
		//	const returnExpression = getNode(G.program, node.returnExpression);
			return call(eval_star, unitExpressions, 0,
				function (unit_exp_vals)  {
					return call(evaluateStep, returnExpression,
						function (return_exp) {
							return call(callback, return_exp);
						});
				});

    default:
      throw `Unexpected node: ${getNodeOrExpType(node)}.`;
  }
}

//For evaluating a list of arguments
function eval_star(exps, pos, callback) {
  if (pos === exps.length) {
    return call(callback, []);
  } else {
    return call(evaluateStep, exps[pos],
			function (x) {
	      return call(eval_star, exps, pos+=1,
			    function (y) {
			      return call(callback, [x].concat(y));
			    });
		  });
  }
}

function evaluate_deconstruction(data_expression, cases, callback) {
	const data_exp = rootNode(data_expression);
	for (var i = 0; i < cases.length; i++) {
		const cs = getNode(G.program, cases[i]);
		if (data_exp.constructor === cs.constructor) {
			const parameters = [];
			for (var i = 0; i < data_exp.parameters.length; i++) {
				parameters[i] = extractFragment(data_expression, data_exp.parameters[i]);
			}
			const parameterIdentifiers = cs.parameterIdentifiers;
			pushEnvironment(parameterIdentifiers, parameters);
			return call(evaluateStep, getNode(G.program, cs.expression),
				function (b) {
					popEnvironment(parameterIdentifiers);
					return call(callback, b);
				});
		}
	}
	//HERE is if nothing matched
}


function evaluateBuiltInFunction(argVals, eval_func, callback) {
	if (argVals.length === 3) { //FOLD
		return call(eval_star, argVals, 0,
								function (evaluated_args) {
									const construction_exp = rootNode(evaluated_args[2]);
									const applied_function = evaluated_args[0];
									const accumulator = evaluated_args[1];
									if (construction_exp.constructor === basis.constructors.Range.id) { //foldr
										const [start, stop, step] = construction_exp.parameters;
										console.log('the case');
										return call(eval_fold_range, applied_function, accumulator, start, stop, step, callback);
									} else { //fold
										return call(eval_fold, applied_function, accumulator, evaluated_args[2], callback);
									}
								});
	}
  else if (argVals.length === 2) {
		return call(evaluateStep, argVals[0],
    function (x) {
      return call(evaluateStep, argVals[1],
        function (y) {
          const arg0 = rootNode(x).value;
          const arg1 = rootNode(y).value;
          return call(callback, builtIn(rootNode(eval_func).reference, arg0, arg1));
        });
    });
  } else if (argVals.length === 1) {
    return call(evaluateStep, argVals[0],
      function(x) {
        const arg1 = x.value; //rootNode?
        return call(callback, builtIn(rootNode(eval_func).reference, x));
      });
  } else {
    return call(callback, builtIn(rootNode(eval_func).reference));
  }
}

function eval_application(argVals, eval_func, callback) {
  const called_function = rootNode(eval_func);
  const called_fun_args = called_function.arguments;
  return call(eval_star, argVals, 0,
    function (binding_vals) {
      pushEnvironment(called_fun_args, binding_vals);
      return call(evaluateStep, getNode(G.program, called_function.body),
        function (b) {
          popEnvironment(called_fun_args);
          return call(callback, b);
        });
    });
}


function eval_fold(f, a, list, callback) {
	if (rootNode(list).constructor === basis.constructors.End.id) { //(tedious? better/different way?)
		return call(callback, a);
	} else {
		const head = extractFragment(list, rootNode(list).parameters[0]);
		const tail = extractFragment(list, rootNode(list).parameters[1]);
		if (getExpressionType(rootNode(f)) === expressionType.BUILT_IN_FUNCTION) {
			const result = builtIn(rootNode(f).reference, rootNode(a).value, rootNode(head).value);
			return call(eval_fold, f, result, tail, callback);
		} else {
			const called_fun_args = rootNode(f).arguments;
			pushEnvironment(called_fun_args, [a, head]);
			return call(evaluateStep, getNode(G.program, rootNode(f).body),
				function (result) {
					popEnvironment(called_fun_args);
					return call(eval_fold, f, result, tail, callback);
				})
		}
	}
}

//NOT WORKING YET
function eval_fold_range(f, a, start, stop, step, callback) {
	if (start >= stop) {
		return call(callback, a);
	} else {
		if (getExpressionType(rootNode(f)) === expressionType.BUILT_IN_FUNCTION) {
			console.log("START" + start);
			const result = builtIn(rootNode(f).reference, rootNode(a).value, start.value); //make sure start is like that (what form)
			return call(eval_fold_range, f, result, start+step, stop, step, callback);
		} else {
			const called_fun_args = rootNode(f).arguments;
			pushEnvironment(called_fun_args, [a, start]);
			return call(evaluateStep, getNode(G.program, rootNode(f).body),
		function (result) {
			popEnvironment(called_fun_args);
			return call(eval_fold, f, result, start+step, stop, step, callback);
		});
		}
	}
}

//For evaluating case statement's cases
function evaluate_cases(exps, callback, elseExp, pos) {
	if (pos === exps.length) {
		return call(evaluateStep, getNode(G.program, elseExp.expression), callback);
	} else {
		const cs = getNode(G.program, exps[pos]);
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

function pushEnvironment(ids, push_vals) {
	for (var i = 0; i < ids.length; i++) {
		if (G.environment[ids[i]]) {
			G.environment[ids[i]].push(push_vals[i]);
		} else {
			G.environment[ids[i]] = [];
			G.environment[ids[i]].push(push_vals[i]);
		}
	}
}

function popEnvironment(ids) {
	for (var i = 0; i < ids.length; i++) {
		G.environment[ids[i]].pop();
	}
}

function lookup(id, env) {
	var value = env[id];
	if (value) {
		value = value[value.length-1];
	}
	return value;
}

// Built In Operations
function builtIn(ref, a1, a2) {
	switch (ref) {
		case basis.references.PLUS:
			return createNumberExpression(a1 + a2);
		case basis.references.MINUS:
			return createNumberExpression(a1 - a2);
		case basis.references.EQUAL:
		 var result = a1 === a2;
		 if (result) {
			 return createConstructionExpression(basis.constructors.True);
		 } else {
			 return createConstructionExpression(basis.constructors.False);
		 }
		case basis.references.TIMES:
			return createNumberExpression(a1 * a2);
		case basis.references.DIVIDE:
			return createNumberExpression(a1 / a2);
		case basis.references.REMAINDER:
			return createNumberExpression(a1 % a2);
		case basis.references.LESS_THAN:
			var result = a1 < a2;
			if (result) {
		 		return createConstructionExpression(basis.constructors.True);
	 		} else {
		 		return createConstructionExpression(basis.constructors.False);
	 		}
		case basis.references.GREATER_THAN:
			var result = a1 > a2;
			if (result) {
		 		return createConstructionExpression(basis.constructors.True);
	 		} else {
		 		return createConstructionExpression(basis.constructors.False);
	 		}
		case basis.references.LESS_EQUAL:
			var result = a1 <= a2;
			if (result) {
				return createConstructionExpression(basis.constructors.True);
			} else {
				return createConstructionExpression(basis.constructors.False);
			}

		case basis.references.RANDOM:
			return createNumberExpression(Math.random());

		case basis.references.MOVE:
			G.move(a1);
			return createNumberExpression(0);
		case basis.references.DRAW:
			G.draw(a1);
			return createNumberExpression(0);
		case basis.references.TURN:
			G.turn(a1);
			return createNumberExpression(0);

	  default:
		 	throw `Unexpected identifier ` + JSON.stringify(ref);
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
	return i;
}

function onFail() {
  console.log("FAIL!");
}

module.exports = {evaluate, onCompletion, onFail};
