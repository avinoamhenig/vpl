const {parseProgram} = require('../../converters/parser-v2v2');
const {unparse} = require('../../converters/unparse');

const ulamNext = `
(define (ulam-next n)
  (cond
    ((zero? (remainder n 2)) (/ n 2))
    (else (+ (* 3 n) 1))))
`

const sourceText = ulamNext + `

(ulam-next 5)
`

const testAst = parseProgram(sourceText);
const unparsed = unparse(testAst);

console.log(unparsed);
