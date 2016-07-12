const ulamNext = `
(define ulam-next
  (lambda (n)
    (cond
      ((= (remainder n 2) 0) (/ n 2))
      (else (+ (* 3 n) 1)))))
`;
const ulamChain = `
(define ulam-chain
  (lambda (n)
    (cond
      ((= n 1) (cons 1 (list)))
      (else (cons n (ulam-chain (ulam-next n)))))))
`;
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
`;
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
`;
// instead of let*, redundantly evaluating split
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
`;
const sourceText =
  ulamNext +
  ulamChain +
  split +
  merge +
  mergeSort +
  `
(ulam-chain 3)
`;
