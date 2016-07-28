const parser = require('./parser-v2');
const eval = require('../evaluators/evaluator-environment-of-stacks');

//var sum = parser.parseProgram('(define sum (lambda (x s) (+ x s))) (fold + 0 (cons 7 (cons 6 (cons 5 (list)))))');
//var sum = parser.parseProgram('(define sum (lambda (x s) (+ x s))) (fold-range sum 0 (CON Range 0 6 1))');
//var randoms = parser.parseProgram('(define build-randoms (lambda (n) (fold-range (lambda (x y) (cons (random) x)) (list) (CON Range 0 n 1)))) (build-randoms 5)');
var test = parser.parseProgram('(define plus (lambda (x b) (+ x b))) (+ 1 3)');
console.log(eval.evaluate(test, eval.onCompletion, eval.onFail, 3, 4, 5));

/*var bfr = parser.parseProgram(`
  (define build-from-range-using-fold
    (lambda (r)
      (fold-range fold-helper (list) r)))

(define fold-helper ;; really just cons with parameters reversed
  (lambda (x y)
      (cons y x)))

  (build-from-range-using-fold (CON Range 0 7 2))`);*/

//var sum_range0 = parser.parseProgram('(define sum (lambda (x s) (+ x s))) (fold-range sum 0 (CON Range 0 1000001 1))');
//console.log(eval.evaluate(sum_range0, eval.onCompletion, eval.onFail, 3, 4, 5));

/*var sum_range1 = parser.parseProgram('(define na (lambda (x) x)) (fold-range + 0 (CON Range 0 100001 1))');
console.log(eval.evaluate(sum_range1, eval.onCompletion, eval.onFail, 3, 4, 5));

var sum = parser.parseProgram('(define sum (lambda (n) (cond ((= n 0) 0) (else (+ n (sum (- n 1))))))) (sum 100000)');
console.log(eval.evaluate(sum, eval.onCompletion, eval.onFail, 3, 4, 5));*/
