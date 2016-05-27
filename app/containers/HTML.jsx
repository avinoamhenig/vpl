import React from 'react'

export default ({
	markup, head, state
}) => (
	<html>
		<head {...(head.htmlAttributes.toComponent())}>
			{ head.meta  .toComponent() }
			{ head.title .toComponent() }
			{ head.base  .toComponent() }
			{ head.link  .toComponent() }
			{ head.script.toComponent() }
			{ head.style .toComponent() }
		</head>
		<body>
			<div id="app" dangerouslySetInnerHTML={{__html: markup}}></div>
			<script dangerouslySetInnerHTML={{__html:
				`window.__INITIAL_STATE__ = ${ JSON.stringify(state) };`
			}}></script>
			<script src="/public/js/client.js"></script>
		</body>
	</html>
);
