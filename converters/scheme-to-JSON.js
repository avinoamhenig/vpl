G.tokens = [];
G.index = 0;


function tokenize(exp) {
  exp = exp.replace(/[\)]/g, " ) ");
  exp = exp.replace(/[\(]/g, " ( ");
  exp = exp.trim();
  G.tokens = exp.split(/\s+/); //definitely way too tedious
}

function reset() {
  G.index = 0;
}

function parse() {
  var token = getNextToken();
  if (token === "(") {
    if (peekNextToken() === 'define') {
        getNextToken();
        var name = getNextToken();
        getNextToken();
        getNextToken();
        var args = [];
        getNextToken();
        while (peekNextToken() !== ")") {
          args.push(getNextToken());
        }
        getNextToken();
        var body = parse();
        if (getNextToken() === ")") {
          return {"name": name, "args": args, "body": body};
        } //ELSE??
    } else if (peekNextToken() === '(') {
        var condition = parse();
        var exp = parse();
        if (getNextToken() === ")") {
          return {"condition": condition, "exp": exp};
        } // ELSE??
    } else if (peekNextToken() === 'else') { /**/
        getNextToken();
        return parse();
    } else if (peekNextToken() === 'cond') {
        getNextToken();
        var cases = [];
        while (peekNextToken() !== ")") {
          cases.push(parse());
        }
        getNextToken();
        var elseExp = cases[cases.length-1];
        cases = cases.slice(0, cases.length-1);
        return {"tag":"case", "cases":cases, "elseExp":elseExp};
    } else if (peekNextToken() === 'let') {
        getNextToken();
        getNextToken();
        var bindings = [];
        while (peekNextToken() !== ")") {
          getNextToken();
          var name = getNextToken();
          var value = parse();
          bindings.push({"name":name, "value":value}); ///
          getNextToken();
        }
        getNextToken();
        var body = parse();
        return {"tag":"let", "body":body, "bindings":bindings};
    } else {
        var func = parse();
        var argVals = [];
        while (peekNextToken() !== ")") {
          argVals.push(parse());
        }
        getNextToken();
        return {"tag":"call", "function":func, "argVals":argVals};
    }
  } else if (token === "'") {
      var ls = [];
      getNextToken();
      while (peekNextToken() != ")") {
        ls.append(parse());
      }
      getNextToken();
      return {"tag":"list","list":ls};
  } else if (Number(token) || token === '0') {
      return {"tag":"number", "val":token};
  } else {
      return {"tag":"identifier", "name": token};
  }
}

function peekNextToken() {
  return G.tokens[G.index];
}

function getNextToken() {
  G.index++;
  return G.tokens[G.index-1];
}
