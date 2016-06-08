import uuid from 'node-uuid';

export default val => ({
	syntaxTag: 'expression',
	tag: 'number',
	val,
	id: uuid.v4()
});
