export const astType = {
	PROGRAM          : 'Program',
	PROGRAM_FRAGMENT : 'ProgramFragment',
	IDENTIFIER       : 'Identifier',
	NODE             : 'Node'
};

export const nodeType = {
	EXPRESSION  : 'Expression',
	CASE_BRANCH : 'CaseBranch',
	ELSE_BRANCH : 'ElseBranch'
};

export const expressionType = {
	NUMBER      : 'NumberExpression',
	IDENTIFIER  : 'IdentifierExpression',
	LAMBDA      : 'LambdaExpression',
	APPLICATION : 'ApplicationExpression',
	CASE        : 'CaseExpression'
};
