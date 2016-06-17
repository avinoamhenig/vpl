const test = require('ava');
const createSum = require('./create_sum');
const oldSum = require('./old_sum');
const v2ToV1 = require('./v2ToV1');

test('v2 sum program is deep-equal to v1 sum program', t => {
	const newSum = v2ToV1(createSum());
	t.deepEqual(newSum, oldSum);
});
