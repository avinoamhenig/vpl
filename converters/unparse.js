// Visual programming Language project
// part of the 2016 Summer Research program at Sarah Lawrence College
// author: Michael Siff
//
// converts (unparses) v2 AST representation to Scheme



const assert = require('assert');
const {
  astType,
  expressionType,
  getAstType,
	getIdentifier,
  getIdentifiersScopedToNode,
  getNode,
  getNodeOrExpType,
  nodeType
} = require('../app/ast');


function unparse(program) {
  assert.strictEqual(getAstType(program), astType.PROGRAM);
  var sb = makeStringBuilder();
  for (const identId of Object.keys(program.identifiers)) {
    const identifier = getIdentifier(program, identId);
    if (identifier.scope === null && identifier.value) {
      sb.push();
      sb.add('define ');
      sb.add(identifier.displayName);
      sb.nl();
      unparseExp(getNode(program, identifier.value), program, sb);
      sb.pop();
      sb.nl();
      sb.nl();
    }
  }
  unparseExp(getNode(program, program.expression), program, sb);
  return sb.toString();
}


function unparseExp(node, program, sb) {
  const boundIds =
    getIdentifiersScopedToNode(program, node.id)
    .filter(id => id.value != null);
  if (boundIds.length > 0) {
    sb.nl();
    sb.push();
    sb.add('let');
    sb.nl();
    sb.push();
    boundIds.forEach(id => unparseBinding(id, program, sb));
    sb.pop();
    sb.nl();
  }
	switch (getNodeOrExpType(node)) {
		case expressionType.NUMBER:
      sb.add(node.value);
      break;

    case expressionType.IDENTIFIER:
      sb.add(getIdentifier(program, node.identifier).displayName);
      break;

    case expressionType.LAMBDA:
      sb.push();
      sb.add('lambda ');
      sb.push();
      sb.add(node.arguments.map(argId =>
        getIdentifier(program, argId).displayName).join(' '));
      sb.pop();
      sb.nl();
      unparseExp(getNode(program, node.body), program, sb);
      sb.pop();
      break;

		case expressionType.APPLICATION:
      sb.push();
      unparseExp(getNode(program, node.lambda), program, sb);
      sb.add(' ');
      for (var i = 0; i < node.arguments.length; i++) {
          unparseExp(getNode(program, node.arguments[i]), program, sb);
          if (i < node.arguments.length - 1) {
            sb.add(' ');
          }
      }
      sb.pop();
      break;

		case expressionType.CASE:
      sb.push();
      sb.add('cond ');
      sb.nl();
      for (var i = 0; i < node.caseBranches.length; i++) {
          unparseCaseBranch(getNode(program, node.caseBranches[i]), program, sb);
          sb.nl();
      }
      unparseElseBranch(getNode(program, node.elseBranch), program, sb);
      sb.pop();
      break;

		default:
			throw `Unexpected node: ${getNodeOrExpType(node)}.`;
	}

  if (boundIds.length > 0) {
    sb.pop();
  }
}


function unparseCaseBranch(node, program, sb) {
  if (getNodeOrExpType(node) === nodeType.CASE_BRANCH) {
    sb.push();
    unparseExp(getNode(program, node.condition), program, sb);
    sb.add(' ');
    unparseExp(getNode(program, node.expression), program, sb);
    sb.pop();
  } else {
    throw `Case-branch node expected; found: ${getNodeOrExpType(node)}.`;
  }
}


function unparseElseBranch(node, program, sb) {
  if (getNodeOrExpType(node) === nodeType.ELSE_BRANCH) {
    sb.push();
    sb.add('else ');
    unparseExp(getNode(program, node.expression), program, sb);
    sb.pop();
  } else {
    throw `Else-branch node expected; found: ${getNodeOrExpType(node)}.`;
  }
}


function unparseBinding(id, program, sb) {
  if (id.displayName && id.value) {
    sb.push();
    sb.add(id.displayName);
    sb.add(' ');
    unparseExp(getNode(program, id.value), program, sb);
    sb.pop();
    sb.nl();
  } else {
    throw `Ill-bound identifier: ${id}.`;
  }
}


// ----------------------
// a simple string builder object
function makeStringBuilder() {
  const TAB = '  ';
  return {
    a: [],
    level: 0,
    push: function () {
      this.a.push('(');
      this.level++;
    },
    pop: function pop() {
      this.a.push(')');
      this.level--;
    },
    nl: function() {
      this.a.push('\n');
      for(var i = 0; i < this.level; i++) {
        this.a.push(TAB);
      }
    },
    toString: function() {
      return this.a.join('');
    },
    add: function(s) {
      this.a.push(s);
    }
  };
}



module.exports = {unparse};
