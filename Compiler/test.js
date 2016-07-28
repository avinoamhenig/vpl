const parser = require('../converters/parser-v2');
const compile = require('./Compiler.js');

var test = parser.parseProgram('(+ (* 2 5) 3))');
console.log(compile.main(test));
