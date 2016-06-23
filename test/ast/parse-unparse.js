const {parseProgram} = require('../../converters/parser-v2');
const {unparse} = require('../../converters/unparse');
const evaluate = require('../../evaluators/JSON-evaluator-v2');

const base = `
(define nil (list))
`
const ulamNext = `
(define ulam-next
  (lambda (n)
    (cond
      ((zero? (remainder n 2)) (/ n 2))
      (else (+ (* 3 n) 1)))))
`
const ulamChain = `
(define ulam-chain
  (lambda (n)
    (cond
      ((= n 1) (cons 1 (list)))
      (else (cons n (ulam-chain (ulam-next n)))))))
`
const split = `
(define split
  (lambda (items)
    (cond
      ((null? items) (cons nil nil))
      ((null? (cdr items)) (list items))
      (else
       (let
           ((s (split (cddr items))))
         (cons (cons (car items) (car s))
               (cons (cadr items) (cdr s))))))))
`
const merge = `
(define merge
  (lambda (a b)
    (cond
      ((null? a) b)
      ((null? b) a)
      (else
        (cond
          ((< (car a) (car b))
          (cons (car a) (merge (cdr a) b)))
          (else
            (cons (car b) (merge a (cdr b)))))))))
`
// using nested let instead of let*
// and, so, redundantly evaluating split
const mergeSort = `
(define mergesort
  (lambda (items)
    (cond
      ((null? items) items)
      ((null? (cdr items)) items)
      (else
        (let
            ((left (mergesort (car (split items))))
             (right (mergesort (cdr (split items)))))
          (merge left right))))))
`
const sourceText =
  base +
  ulamNext +
  ulamChain +
  split +
  merge +
  mergeSort +
  `
(ulam-chain 3)
`

const testAst = parseProgram(sourceText);
const unparsed = unparse(testAst);

// this fails because parser currently relies on order
// const reparsed = parseProgram(unparsed);

evaluate.main(testAst, evaluate.onCompletion, evaluate.onFail);
