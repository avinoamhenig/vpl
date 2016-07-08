const {parseProgram} = require('../../converters/parser-v2');

const sourceText = `
(define sum
  (lambda (xs)
    (MATCH xs
      ((NIL) 0)
      ((CONS head tail) (+ head (sum tail))))))

(sum (cons 3 (cons 5 (cons 7 (list)))))
`

const testAst = parseProgram(sourceText);
console.log(testAst);
