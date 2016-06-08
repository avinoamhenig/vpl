import json

fun_def_dicts = []
functions = ['+', '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>=']
environment = []


def loadJSON(json_fun_defs):
    global fun_def_dicts, functions
    fun_def_dicts = [json.loads(j) for j in json_fun_defs]
    fs = [d['name'] for d in fun_def_dicts]
    functions = fs + functions

def main(forest, exp):
    loadJSON(forest)
    if ('args' in exp): #if it's a function_def
        return evaluate(exp['body'])
    else:
        return evaluate(exp)


def evaluate(obj):
    global fun_def_dicts, functions, environment
    if ('tag' in obj):
        tag = obj['tag']
        if (tag == 'number'):
            return eval(obj['val'])
        elif (tag == 'identifier'):
            name = obj['name']
            if (name in environment[-1]):
                return environment[-1][name]
            else:
                return "Undefined identifier: %s" % name
        elif (tag == 'case'):
            cases = obj['cases']
            elseExp = obj['elseExp']
            for case_exp in cases:
                condition = evaluate(case_exp['condition'])
                if (condition):
                    return evaluate(case_exp['exp'])
            return evaluate(elseExp)
        elif (tag == 'call'):
            function = obj['function']
            argVals = obj['argVals']
            builtInFuns = ['+', '-', '*', 'div', 'modulo', '=', '!=','<', '>', '<=', '>=']
            if (function['name'] in builtInFuns):
                arg1 = evaluate(argVals[0])
                arg2 = evaluate(argVals[1])
                index = builtInFuns.index(obj['function']['name'])
                return builtIn(arg1, arg2, index)
            else:
                arguments = []
                for arg in argVals:
                    arguments.append(evaluate(arg))
                if (not (function['name'] in functions)):
                    return "ERROR: %s is undefined" % function['name']
                called_fun = fun_def_dicts[functions.index(function['name'])]
                called_fun_args = called_fun['args']
                new_env = {}
                for i in range(len(called_fun_args)):
                    new_env[called_fun_args[i]] = arguments[i]
                environment.append(new_env)
                result = evaluate(called_fun['body'])
                environment.pop()
                return result
        elif (tag == 'list'):
            #?
            #evaluate the inner items?
            return obj['list']
        elif (tag == 'let'):
            bindings = obj['bindings']
            new_env = {}
            for let_binding in bindings:
                new_env[let_binding['name']] = evaluate(let_binding['value'])
            environment.append(new_env)
            result = evaluate(obj['body'])
            environment.pop()
            return result
    else:
        return "Unidentified object"

def builtIn(a1, a2, i):
    if i == 0:
        return a1 + a2
    elif i == 1:
        return a1 - a2
    elif i == 2:
        return a1 * a2
    elif i == 3:
        return a1 // a2
    elif i == 4:
        return a1 % a2
    elif i == 5:
        return a1 == a2
    elif i == 6:
        return a1 != a2
    elif i == 7:
        return a1 < a2
    elif i == 8:
        return a1 > a2
    elif i == 9:
        return a1 <= a2
    else:
        return a1 >= a2
