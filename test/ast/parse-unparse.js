const {parseProgram} = require('../../converters/parser-v2');
const {unparse} = require('../../converters/unparse');

// using % instead of remainder ... for now
const base = `
(define nil (list))
`
const ulamNext = `
(define ulam-next
  (lambda (n)
    (cond
      ((= (remainder n 2) 0) (/ n 2))
      (else (+ (* 3 n) 1)))))
`
const ulamChain = `
(define ulam-chain
  (lambda (n)
    (cond
      ((= n 1) (list 1))
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
const mergeSort = `
(define mergesort
  (lambda (items)
    (cond
      ((null? items) items)
      ((null? (cdr items)) items)
      (else
        (let
            ((p (split items)))
          (let
              ((left (mergesort (car p)))
               (right (mergesort (cdr p))))
            (merge left right)))))))
`
const sourceText =
  base +
  ulamNext +
  ulamChain +
  split +
  merge +
  mergeSort +
  `
(mergesort (ulam-chain 3))
`

const testAst = parseProgram(sourceText);
const unparsed = unparse(testAst);

console.log(unparsed);
