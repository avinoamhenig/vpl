const {parseProgram} = require('../../converters/parser-v2');

const sourceText = `
(define draw-triangle
  (lambda (size)
    (do
      (draw size)
      (turn 120)
      (draw size)
      (turn 120)
      (draw size)
      (turn 120))))

(define fractal-tri
  (lambda (size)
    (cond
      ((<= size 10) (draw-triangle size))
      (else
        (let
            ((half (/ size 2)))
          (do
            (move half)
            (fractal-tri half)
            (turn 120)
            (fractal-tri half)
            (turn 300)
            (move half)
            (turn 60)
            (fractal-tri half)
            (turn 120)
            (move half)
            (turn 120)
            (move (* -1 half))

(fractal-tri 80)
`

const testAst = parseProgram(sourceText);
console.log(testAst);
