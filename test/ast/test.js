const createSum = require('./create_sum');

// console.log(JSON.stringify(createSum()));

const {
  createConstructionExpression,
  createDeconstructionExpression,
  createDeconstructionCase,
  createNumberExpression
} = require('../../app/ast');

const {
  constructors
} = require('../../app/basis');

console.log(
  createDeconstructionExpression(
    createConstructionExpression(constructors.True),
    [
      createDeconstructionCase(constructors.True, [],
        createNumberExpression(0)),
      createDeconstructionCase(constructors.False, [],
        createNumberExpression(0))
    ]
  )
);
