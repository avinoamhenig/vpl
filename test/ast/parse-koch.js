const {parseProgram} = require('../../converters/parser-v2');

const sourceText = `
(define koch
  (lambda (size)
    (cond
     ((< size 1)
      (draw 1))
     (else
      (let
          ((third  (/ size 3)))
        (DO
         (koch third)
         (turn -60)
         (koch third)
         (turn 120)
         (koch third)
         (turn -60)
         (koch third)))))))
(koch 50)
`

const testAst = parseProgram(sourceText);
console.log(testAst);
