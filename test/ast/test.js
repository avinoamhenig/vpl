const createSum = require('./create_sum');
const oldSum = require('./old_sum');
const v2ToV1 = require('./v2ToV1');

const newSum = v2ToV1(createSum());
console.log(
  JSON.stringify(oldSum) === JSON.stringify(newSum)
);
