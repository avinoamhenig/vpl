import React from 'react'
import name from 'lib/name'

export default name('Icon')(p => {
	let className = `fa fa-${p.icon}`;

	if (p.rotate) className += ` fa-rotate-${p.rotate}`;

	return (
		<span className={className}></span>
	);
});
