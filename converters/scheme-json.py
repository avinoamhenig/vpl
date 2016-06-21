import json
import re

class SchemetoJSON:

    def __init__(self, exp):
        self.expression = exp
        self.tokens = tokenize(self.expression)
        self.index = 0
        self.JSON = json.dumps(self.parse())

    def parse(self):
        token = self.getNextToken()
        if token == "(":
            if self.peekNextToken() == "define":
                self.getNextToken() #define
                name = self.getNextToken()
                assert (self.getNextToken() == '(')
                assert (self.getNextToken() == 'lambda')
                args = []
                assert (self.getNextToken() == "(") #for args
                while (self.peekNextToken() != ")"): #move this
                    args.append(self.getNextToken())
                self.getNextToken() #get the ")"
                body = self.parse()
                if (self.getNextToken() == ")"):
                    return Function_Def(name, args, body).__dict__
            elif self.peekNextToken() == "(": #case expression
                condition = self.parse()
                exp = self.parse()
                if (self.getNextToken() == ")"):
                    return CaseExp(condition, exp).__dict__
            elif self.peekNextToken() == "else":
                self.getNextToken() #else
                return self.parse()
            elif self.peekNextToken() == "cond":
                self.getNextToken() #"cond"
                cases = []
                while (self.peekNextToken() != ")"):
                    cases.append(self.parse())
                self.getNextToken()
                elseExp = cases[-1]
                cases = cases[:-1]
                return Case(cases, elseExp).__dict__
            elif self.peekNextToken() == "let":
                self.getNextToken() #let
                assert (self.getNextToken() == '(')
                while (self.peekNextToken() != ")"):
                    print(bindings)
                    assert (self.getNextToken() == '(')
                    name = self.getNextToken()
                    value = self.parse()
                    bindings.append(Let_Binding(name, value).__dict__)
                    self.getNextToken()
                self.getNextToken()
                body = self.parse()
                return Let(body, bindings).__dict__
            else:
                function = self.parse()
                argVals = []
                while (self.peekNextToken() != ")"): #doesn't handle lists w/i lists
                    argVals.append(self.parse())
                self.getNextToken()
                return Call(function, argVals).__dict__
        elif (token == "'"):
            ls = []
            self.getNextToken()
            while (self.peekNextToken() != ")"):
                ls.append(self.parse())
            self.getNextToken()
            return List(ls).__dict__
        elif isNumber(token):
            return Number(token).__dict__
        else:
            return Identifier(token).__dict__

    def defLetExps(self, other):
        bindings = []
        return bindings
        
    def getNextToken(self):
        self.index += 1
        return self.tokens[self.index-1]

    def peekNextToken(self):
        return self.tokens[self.index]

    def peekToken(self, n):
        return self.tokens[n]


class JSONtoScheme:

    def __init__(self, exp):
        self.expression = json.loads(exp)
        

    def parse(self, d):
        if ('tag' in d):
            tag = d['tag']
            if (tag == 'number'):
                return eval(d['val'])
            elif (tag== 'identifier'):
                return d['name']
            elif (tag == 'case'):
                return self.setupCond(d)
            elif (tag == 'call'):
                return self.setupCall(d)
            elif (tag == 'list'):
                return self.setupList(d)
            elif (tag == 'let'):
                return self.setupLet(d)
        elif ('condition' in d):
            condition = self.parse(d['condition'])
            expression = self.parse(d['exp'])
            return [condition] + [expression]
        else:
            return self.setupFunctionDef(d)

    def setupCond(self, d):
        cond = ['cond']
        cases = []
        for case in d['cases']:
            cases.append(self.parse(case))
        elseExp = self.parse(d['elseExp'])
        cases += [['else'] + [elseExp]]
        return cond + cases

    def setupCall(self, d):
        function = self.parse(d['function'])
        argVals = []
        for exp in d['argVals']:
            argVals.append(self.parse(exp))
        return [function] + argVals

    def setupFunctionDef(self, d):
        funDef = ['define']
        funDef.append(d['name'])
        lam = ['lambda', d['args']]
        body = self.parse(d['body'])
        lam += [body]
        funDef += [lam]
        return funDef

    def setupList(self, d):
        items = []
        items.append("^") #to indicate that this is a list TODO: change
        for i in d['list']:
            items.append(self.parse(i))
        return items

    def setupLet(self, d):
        let = ['let']
        bindings = []
        for binding in d['bindings']:
            let_binding = []
            let_binding.append(binding['name'])
            let_binding.append(self.parse(binding['value']))
            bindings.append(let_binding)
        let.append(bindings)
        let += [self.parse(d['body'])]
        return let
            
            
    def toScheme(self):
        list_version = self.parse(self.expression)
        scheme = ''
        string = str(list_version)
        for i in string:
            if (i == "["):
                scheme += "("
            elif (i == "'"):
                pass
            elif (i == "]"):
                scheme += ")"
            elif (i == ","):
                pass
            elif (i == "^"):
                scheme = scheme[:len(scheme)-1] + "'" + scheme[len(scheme)-1:]
            else:
                scheme += i
        return scheme
    
#helpers
def tokenize(expression):
    exp = re.sub('([,()])', r' \1 ', expression)
    tokens = exp.split()
    return tokens


def isNumber(n):
    try:
        float(n)
        return True
    except ValueError:
        return False

#Classes
class Expression:
    def __init__(self):
        self.val = 0 #no reason

class Function_Def(Expression):
    def __init__(self, name, args, body):
        self.name = name
        self.args = args
        self.body = body

class Number:
    def __init__(self, n=0):
        self.tag = "number"
        self.val = n

class Identifier:
    def __init__(self, the_identifier):
        self.tag = "identifier"
        self.name = the_identifier

class Case(Expression):
    def __init__(self, cases, elseExp):
        self.tag = "case"
        self.cases = cases #list
        self.elseExp = elseExp

class CaseExp(Expression):
    def __init__(self, condition, exp):
        self.condition = condition
        self.exp = exp

class Call(Expression):
    def __init__(self, function, argVals):
        self.tag = "call"
        self.function = function
        self.argVals = argVals #list

class List(Expression):
    def __init__(self, ls):
        self.tag = "list"
        self.list = ls 

class Let(Expression):
    def __init__(self, body, bindings):
        self.tag = "let"
        self.body = body
        self.bindings = bindings #list
        
class Let_Binding(Expression):
    def __init__(self, binding_identifier, value):
        self.name = binding_identifier
        self.value = value
    
