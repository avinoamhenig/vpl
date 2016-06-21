import React from 'react'
import ExpressionView from '../ExpressionView'

export default (props, subExpressionId) => (
	<ExpressionView
		{...props}
		key={subExpressionId}
		expressionId={subExpressionId}
		nestedLevel={props.nestedLevel + 1}
		/>
);
