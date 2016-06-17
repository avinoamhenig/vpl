module.exports.astType = {
	PROGRAM          : 'Program',
	PROGRAM_FRAGMENT : 'ProgramFragment',
	IDENTIFIER       : 'Identifier',
	NODE             : 'Node'
};

module.exports.nodeType = {
	EXPRESSION  : 'Expression',
	CASE_BRANCH : 'CaseBranch',
	ELSE_BRANCH : 'ElseBranch'
};

module.exports.expressionType = {
	NUMBER      : 'NumberExpression',
	IDENTIFIER  : 'IdentifierExpression',
	LAMBDA      : 'LambdaExpression',
	APPLICATION : 'ApplicationExpression',
	CASE        : 'CaseExpression'
};
