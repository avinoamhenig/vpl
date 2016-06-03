let simpleToString = e => {
	if (e.tag === 'identifier') {
		if (e.name === 'modulo') { return '%'; }
		return e.name;
	} else if (e.tag === 'number') {
		return '' + e.val;
	} else {
		return e;
	}
};

export default simpleToString;
