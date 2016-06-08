
var fun_def_dicts = []
var functions = ['+', '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>=']
var environment = []

function loadJSON(json_fun_defs) {
  for (var i = 0; i < json_fun_defs.length; i++) {
    fun_def_dicts[i] = JSON.parse(json_fun_defs[i]);
  }
  fs = fun_def_dicts.map(function (d) {
    return d.name;
  })
  functions = fs.concat(functions);
}

function main(forest, exp) {
  loadJSON(forest);
  return evaluate(exp);
}

function evaluate(d) {
  if('tag' in d) {
    var tag = d.tag;
    if (tag === 'number') {
      return Number(d.val);
    } else if (tag === 'identifier') {
      var name = d.name;
      if (name in environment[environment.length-1]) {
        return environment[environment.length-1][name];
      }
      else {
        console.log("Undefined Identifier" + name);
        return "Unidentified Identifier"
      }
    } else if (tag === 'case') {
      var cases = d.cases;
      for (var i = 0; i < cases.length; i++) {
        var case_exp = cases[i];
        var condition = evaluate(case_exp.condition);
        if (condition) return evaluate(case_exp.exp);
      }
      return evaluate(d.elseExp); //but what if the thing above returns?
    } else if (tag === 'call') {
      var fun = d.function;
      var argVals = d.argVals;
      var builtInFuns = ["+", '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>='];
      if (builtInFuns.indexOf(fun.name) != -1) {
        var arg1 = evaluate(argVals[0]);
        var arg2 = evaluate(argVals[1]);
        var index = builtInFuns.indexOf(d.function.name)
        return builtIn(arg1, arg2, index);
      } else {
        //var args = [];
        /*for (var i = 0; i < argVals.length; i++) {
          arguments.push(evaluate(argVals[i]));
        }*/
        var args = argVals.map(function (arg) {return evaluate(arg);});
        if (functions.indexOf(fun.name) === -1) {
          return "ERROR: function is undefined" //how to do this nicer
        }
        var called_fun = fun_def_dicts[functions.indexOf(fun.name)];
        var called_fun_args = called_fun.args;
        var new_env = {};
      /*  for (var i = 0; i < called_fun_args.length; i++) {
          new_env[called_fun_args[i]] = arguments[i];
        }*/
        called_fun_args.forEach(function (cfa, i) {new_env[cfa] = args[i];});
        environment.push(new_env);
        var result = evaluate(called_fun.body);
        environment.pop();
        return result;
      }
    } else if (tag === 'list') {
      return d.list; //?
    } else if (tag === 'let') {
      var bindings = d.bindings;
      new_env = {};
      bindings.forEach(function (let_binding) {
        new_env[let_binding.name] = evaluate(let_binding.value);
      });
      environment.push(new_env);
      var result = evaluate(d.body);
      environment.pop();
      return result;
    }
  } else {
    return "ERROR: Unidentified object"
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
