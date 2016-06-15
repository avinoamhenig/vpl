import test from 'ava';
import createSum from './create_sum';
import oldSum from './old_sum';

test('construct-ast', t => {
	const sum = createSum();
	console.log(JSON.stringify(sum, null, 2));

	t.pass();
});
