import json

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
 #               name = self.parse()
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
                self.getNextToken() ##
                elseExp = cases[-1]
                cases = cases[:-1]
                return Case(cases, elseExp).__dict__
                
            else: #the only cases left are id or call
                #can never be an id after a parentheses (immediately after)
                #unless it's an argument but that goes in the lambda case
                function = self.parse()
                argVals = []
                while (self.peekNextToken() != ")"):
                    argVals.append(self.parse())
                self.getNextToken() ##
                return Call(function, argVals).__dict__
                
        elif isNumber(token):
            return Number(token).__dict__
        else:
            return Identifier(token).__dict__

    def getNextToken(self):
        self.index += 1
        return self.tokens[self.index-1]

    def peekNextToken(self):
        return self.tokens[self.index]

    def peekToken(self, n):
        return self.tokens[n]


import re

COMMENT_SYMBOL = ';'

def tokenize(expression):
    exp = re.sub('([,()])', r' \1 ', expression)
    tokens = exp.split()
    return tokens


class JSONtoScheme:

    def __init__(self, exp):
        self.expression = json.loads(exp)
        

    def parse(self, d):
        if ('tag' in d):
            if (d['tag'] == 'number'):
                return eval(d['val'])
            elif (d['tag'] == 'identifier'):
                return d['name']
            elif (d['tag'] == 'case'):
                return self.setupCond(d)
            elif (d['tag'] == 'call'):
                return self.setupCall(d)
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
        funDef.append(self.parse(d['name']))
        lam = ['lambda', d['args']]
        body = self.parse(d['body'])
        lam += [body]
        funDef += [lam]
        return funDef
            
            
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
            else:
                scheme += i
        return scheme
    
        


def isNumber(n):
    try:
        float(n)
        return True
    except ValueError:
        return False


class Expression:
    def __init__(self):
        self.val = 0

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
