if (process.argv.length !== 3) {
  console.log('Usage: node ' + process.argv[1] + ' <filename>');
  process.exit(1);
}

const fs = require('fs');
const {parseProgram} = require('../../converters/parser-v2');
const eval = require('../../evaluators/evaluator-data-constructors');

const source = fs.readFileSync(process.argv[2], 'utf8');
const parsed = parseProgram(source);
const evaluated = eval.evaluate(parsed, eval.onCompletion, eval.onFail);
console.log(evaluated);
