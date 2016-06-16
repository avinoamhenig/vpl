import test from 'ava';
import createSum from './create_sum';
import oldSum from './old_sum';
import v2ToV1 from './v2ToV1';

test('v2 sum program is deep-equal to v1 sum program', t => {
	const newSum = v2ToV1(createSum());
	t.deepEqual(newSum, oldSum);
});
