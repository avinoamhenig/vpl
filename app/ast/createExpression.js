import uuid from 'node-uuid';

export default function createExpression(val = 0) {
	if (val === '__--case--__') {
		return {
			syntaxTag: 'expression',
			tag: 'case',
			id: uuid.v4(),
			cases: [{
				syntaxTag: 'case_exp',
				id: uuid.v4(),
				condition: createExpression(),
				exp: createExpression()
			}],
			elseExp: {
				syntaxTag: 'else_exp',
				id: uuid.v4(),
				exp: createExpression()
			}
		};
	} else if (val === '__--call--__') {
		return {
			syntaxTag: 'expression',
			tag: 'call',
			id: uuid.v4(),
			function: createExpression('f'),
			argVals: [createExpression()]
		};
	} else if (val === '__--case_exp--__') {
		return {
			syntaxTag: 'case_exp',
			id: uuid.v4(),
			condition: createExpression(),
			exp: createExpression()
		};
	}

	switch (typeof val) {

		case 'number':
			return {
				syntaxTag: 'expression',
				tag: 'number',
				id: uuid.v4(),
				val
			};

		case 'string':
			return {
				syntaxTag: 'expression',
				tag: 'identifier',
				id: uuid.v4(),
				name: val
			};

		default: return createExpression();
	}
};
