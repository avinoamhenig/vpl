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
G.DELAY = 100;

function main(forest, exp, uponComplete, uponFail) {
  loadJSON(forest);
  G.continue = true;
  evaluateStep(exp, uponComplete, uponFail);
}

function loadJSON(json_fun_defs) {
  for (var i = 0; i < json_fun_defs.length; i++) {
    G.fun_def_dicts[i] = JSON.parse(json_fun_defs[i]);
  }
  fs = G.fun_def_dicts.map(function (d) {
    return d.name;
  })
  G.functions = fs.concat(G.functions);
}

function setTO(e, callback, fail) {
  setTimeout(evaluateStep, G.DELAY, e, callback, fail);
}

function evaluateStep(exp, callback, uponFail) {
  if (G.continue) {
    if ('tag' in exp) {
      var tag = exp.tag;
      if (tag === 'number') {
        callback(Number(exp.val));
      } else if (tag === 'identifier') {
        var name = exp.name;
        callback(environment[environment.length-1][name]);
      } else if (tag === 'case') {
        var cases = exp.cases;
        var case_exp = cases[0]; //
        setTO(case_exp.condition, function (x) {
          if (x) {
            setTO(case_exp.exp, function (y) {
              callback(y);}, uponFail);
          } else {
            setTO(exp.elseExp, function (z) {
              callback(z);}, uponFail);
          }
        }, uponFail);
      } else if (tag === 'call') {
        var fun = exp.function;
        var argVals = exp.argVals;
        var builtInFuns = ["+", '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>='];
        if (builtInFuns.indexOf(fun.name) != -1) {
          setTO(argVals[0], function (x) {
            setTO(argVals[1], function (y) {
              callback(builtIn(x, y, builtInFuns.indexOf(fun.name)));
            },
            uponFail);
          }, uponFail);
        }
      }
    } else if ('tag' === 'list') {
      callback(exp.list); //?
    } else if ('tag' === 'let') {
      var bindings = exp.bindings;
      new_env = {};
    }
  } else {
    uponFail();
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
