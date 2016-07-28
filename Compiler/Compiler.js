const {
  astType,
  expressionType,
  getAstType,
  getIdentifier,
  getIdentifiersScopedToNode,
  getNode,
  getNodeOrExpType,
  nodeType,
  getExpressionType
} = require('../app/ast');
const basis = require('../app/basis');

const G = {counter: 0,
            intermediate_code : []};

function getBuiltInOperator(ref) {
  switch (ref) {
    case basis.references.PLUS:
      return '+';
    case basis.references.MINUS:
      return '-';
    case basis.references.TIMES:
      return '*';
    case basis.references.DIVIDE:
      return '/';
    case basis.references.REMAINDER:
      return 'remainder';
  }
}

function main(program) {
  console.log(parseExp(getNode(program, program.expression), program, G.intermediate_code));
  console.log(G.intermediate_code);
}

function parseExp(node, program, intermediate_code) {
  switch (getNodeOrExpType(node)) {
    case expressionType.NUMBER:
      const reg = makeRegister('t');
      const copyExp = { type: 'copy',
                        destination: reg,
                        value: node.value
                      };
      G.intermediate_code.push(copyExp);
      return reg;
    case expressionType.IDENTIFIER:
    case expressionType.LAMBDA:
    case expressionType.APPLICATION:
      //really roundabout and not good way to do this
      var lambda = getNode(program, node.lambda);
      var id = program.identifiers[lambda.identifier].value;
      var funct = getNode(program, id);
      //end of roundabout and not good way
      if (getExpressionType(funct) === expressionType.BUILT_IN_FUNCTION) {
        const arg0 = parseExp(getNode(program, node.arguments[0]), program, intermediate_code);
        const arg1 = parseExp(getNode(program, node.arguments[1]), program, intermediate_code);
        const dest = makeRegister('t');
        const builtInExp = {  type: 'builtInOperation',
                              destination: dest,
                              op: getBuiltInOperator(funct.reference),
                              arg0: arg0,
                              arg1: arg1
                            };
        G.intermediate_code.push(builtInExp);
        return dest;
      } else {
        console.log('not built in operation');
      }
    case expressionType.CASE:
      break;
  }
}

function parseCaseBranch(node, program) {

}

function parseElseBranch(node, program) {

}

function makeRegister(s) {
  const register = s + G.counter;
  G.counter++;
  return register;
}

module.exports = {main};
