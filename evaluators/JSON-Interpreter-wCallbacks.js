/*for testing independently*/
function uponComplete(i) {
  console.log("Success: " + i);
}

function uponFail() {
  console.log("FAIL!");
}


var G = {};

G.fun_def_dicts = []
G.functions = ['+', '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>=']
G.environment = []
G.DELAY = 10;

function main(forest, exp, uponComplete, uponFail) {
  loadJSON(forest);
  G.continue = true;
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

function setTO(e, callback, fail) {
  setTimeout(evaluateStep, G.DELAY, e, callback, fail);
}

function evaluateStep(exp, callback, uponFail) {
  // console.log(uponFail);
  if (G.continue) {
    console.log('Eval Step: ', exp);
    if ('tag' in exp) {
      var tag = exp.tag;
      if (tag === 'number') {
        callback(Number(exp.val));
      } else if (tag === 'identifier') {
        var name = exp.name;
        callback(G.environment[G.environment.length-1][name]);
      } else if (tag === 'case') {
        var cases = exp.cases;
        eval_cond(cases, exp.elseExp, callback);
        function eval_cond(exps, elseExp, callback) {
          if (exps.length === 0) {
            setTO(elseExp, callback, uponFail);
          } else {
            setTO(exps[0].condition, function (cond) {
                    if (cond) setTO(exps[0].exp, callback, uponFail);
                    else eval_cond(exps.slice(1, exps.length), elseExp, callback);
                  },
                  uponFail);
            }
        }
      } else if (tag === 'call') {
        var fun = exp.function;
        var argVals = exp.argVals;
        var builtInFuns = ["+", '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>='];
        if (builtInFuns.indexOf(fun.name) != -1) {
          setTO(argVals[0], function (x) {
            setTO(argVals[1], function (y) {
              callback(builtIn(x, y, builtInFuns.indexOf(fun.name)));
            }, uponFail);
          }, uponFail);
        } else {
          var called_fun = G.fun_def_dicts[G.functions.indexOf(fun.name)];
          var called_fun_args = called_fun.args; //binding_names
          eval_star(argVals, function (binding_vals) {
            binding_vals = binding_vals.reverse();
            var n_e = extend(called_fun_args, binding_vals);
            G.environment.push(n_e);
            setTO(called_fun.body, function (b) {
              callback(b); G.environment.pop();
            }, uponFail);
            });
          }
      } else if (tag === 'list') {
          callback(exp.list); //?
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
            binding_vals = binding_vals.reverse();
            n_e = extend(binding_names, binding_vals);
            G.environment.push(n_e);
            setTO(body, function (b) {
              callback(b); G.environment.pop();}, uponFail);
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
function eval_star(exps, callback, uponFail) { //uponFail??
  if (exps.length === 0) {
    callback([]);
  } else {
    setTO(exps[0], function (x) {
        eval_star(exps.slice(1, exps.length), function (y) {
                    callback(y.concat(x)); //gives it to you in reverse order
                  });
                }, uponFail);
  }
}


function builtIn(a1, a2, i) {
  if (i === 0) return a1 + a2;
  else if (i === 1) return a1 - a2;
  else if (i === 2) return a1 * a2;
  else if (i === 3) return Math.floor(a1/a2);
  else if (i === 4) return a1 % a2;
  else if (i === 5) return a1 === a2;
  else if (i === 6) return a1 != a2;
  else if (i === 7) return a1 < a2;
  else if (i === 8) return a1 > a2;
  else if (i === 9) return a1 <= a2;
  else return a1 >= a2;
}

function stopEval() {
  G.continue = false;
}
