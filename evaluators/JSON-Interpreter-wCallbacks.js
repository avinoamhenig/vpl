/*for testing independently*/
function uponComplete(i) {
  G.elapsedTime = Date.now() - G.InitialTime;
  console.log("Success: " + JSON.stringify(i));
}

function uponFail() {
  console.log("FAIL!");
}


var G = {};

G.fun_def_dicts = [];
G.functions = ['+', '-', '*', '/', 'div', '%', '=', '!=','<', '>', '<=', '>=', 'cons', 'null?', 'car', 'cdr', 'cddr', 'cadr', 'list'];
G.environment = [];
G.DELAY = 0;
G.fast = false;

function main(forest, exp, uponComplete, uponFail) {
  loadJSON(forest);
  G.continue = true;
  G.environment = [];
  G.InitialTime = Date.now();
  evaluateStep(exp, uponComplete, uponFail);
}

function loadJSON(json_fun_defs) {
  for (var i = 0; i < json_fun_defs.length; i++) {
    G.fun_def_dicts[i] = JSON.parse(json_fun_defs[i]);
  }
  var fs = G.fun_def_dicts.map(function (d) {
    return d.name;
  })
  G.functions = fs.concat(G.functions);
}

function R(f, exp, callback, fail) {
  if (G.fast || exp.tag == "number" || exp.tag == "identifier") {
    return f(exp, callback, fail);
  } else {
    setTimeout(f, G.DELAY, exp, callback, fail);
  }
}

function evaluateStep(exp, callback, uponFail) {
  if (G.continue) {
    if ('tag' in exp) {
      var tag = exp.tag;
      if (tag === 'number') {
        callback(Number(exp.val));
      } else if (tag === 'identifier') {
        var name = exp.name;
        if (lookup(name, G.environment)) {
          callback(getVariable(name, G.environment));
        } else {
          G.continue = false;
          uponFail();
        }
      } else if (tag === 'case') {
        var cases = exp.cases;
        eval_cond(cases, exp.elseExp, callback);
        function eval_cond(exps, elseExp, callback) {
          if (exps.length === 0) {
            R(evaluateStep, elseExp, callback, uponFail);
          } else {
            R(evaluateStep, exps[0].condition, function (cond) {
              if (cond) R(evaluateStep, exps[0].exp, callback, uponFail);
              else eval_cond(exps.slice(1, exps.length), elseExp, callback);
            }, uponFail);
          }
        }
      } else if (tag === 'call') {
        var fun = exp.function;
        var argVals = exp.argVals;
        var builtInFuns = ["+", '-', '*', '/' , 'div', '%', '=', '!=','<', '>', '<=', '>=', 'cons', 'null?', 'car', 'cdr', 'cddr', 'cadr', 'list'];
        if (builtInFuns.indexOf(fun.name) !== -1) {
          if (argVals.length === 2) {
            R(evaluateStep, argVals[0], function (x) {
              R(evaluateStep, argVals[1], function (y) {
                callback(builtIn(builtInFuns.indexOf(fun.name), x, y));
              },
              uponFail);
            }, uponFail);
          } else if (argVals.length === 1) {
              R(evaluateStep, argVals[0], function (x) {
                callback(builtIn(builtInFuns.indexOf(fun.name), x));
              }, uponFail);
          } else {
             callback([]);
          }
        } else {
          if (G.functions.indexOf(fun.name) === -1) {
            G.continue = false;
            uponFail();
          }
          var called_fun = G.fun_def_dicts[G.functions.indexOf(fun.name)];
          var called_fun_args = called_fun.args;
          eval_star(argVals, function (binding_vals) {
            //check for same number of arguments?
            var n_e = extend(called_fun_args, binding_vals);
            G.environment.push(n_e);
            R(evaluateStep, called_fun.body, function (b) {
              G.environment.pop();
              callback(b);
            }, uponFail);
            });
          }
      } else if (tag === 'let') {
          var bindings = exp.bindings;
          var binding_names = [];
          var binding_expressions = [];
          var body = exp.body;
          for (var i = 0; i < bindings.length; i++) {
            binding_names.push(bindings[i].name);
            binding_expressions.push(bindings[i].value);
          }
          eval_star(binding_expressions, function (binding_vals) {
            var n_e = extend(binding_names, binding_vals);
            G.environment.push(n_e);
            R(evaluateStep, body, function (b) {
              G.environment.pop();
              callback(b);
            }, uponFail);
            });
        }
      }
  } else {
    uponFail();
  }
}

function extend(new_syms, new_vals) {
  var new_env = {};
  for (var i = 0; i < new_syms.length; i++) {
    new_env[new_syms[i]] = new_vals[i];
  }
  return new_env;
}


//this will give you back a list of evaluated results
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
                }
      , uponFail);
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
