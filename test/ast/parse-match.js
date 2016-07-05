const {parseProgram} = require('../../converters/parser-v2');

const sourceText = `
(define length
  (lambda (xs)
    (MATCH xs
      ((NIL) 0)
      ((CONS head tail) (+ 1 (length tail))))))

(length (list 3 5 7))
`

const testAst = parseProgram(sourceText);
console.log(testAst);
