import React from 'react'
import name from 'lib/name'

export default name('Icon')(({ icon }) => (
	<span className={`fa fa-${icon}`}></span>
));
