const {parseProgram} = require('../../converters/parser-v2');

const sourceText = `
(define sum
  (lambda (xs)
    (MATCH xs
      ((NIL) 0)
      ((CONS head tail) (+ head (sum tail))))))

(sum (list 3 5 7))
`

const testAst = parseProgram(sourceText);
console.log(testAst);
