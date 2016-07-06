module.exports.astType = {
	PROGRAM          : 'Program',
	PROGRAM_FRAGMENT : 'ProgramFragment',
	IDENTIFIER       : 'Identifier',
	NODE             : 'Node',
	CONSTRUCTOR      : 'Constructor',
	TYPE_DEFINITION  : 'TypeDefinition',
	TYPE_VARIABLE    : 'TypeVariable',
	TYPE_INSTANCE    : 'TypeInstance'
};

module.exports.nodeType = {
	EXPRESSION          : 'Expression',
	CASE_BRANCH         : 'CaseBranch',
	ELSE_BRANCH         : 'ElseBranch',
	DECONSTRUCTION_CASE : 'DeconstructionCase'
};

module.exports.expressionType = {
	NUMBER            : 'NumberExpression',
	IDENTIFIER        : 'IdentifierExpression',
	LAMBDA            : 'LambdaExpression',
	APPLICATION       : 'ApplicationExpression',
	CASE              : 'CaseExpression',
	CONSTRUCTION      : 'ConstructionExpression',
	DECONSTRUCTION    : 'DeconstructionExpression',
	DEFAULT           : 'DefaultExpression',
	BUILT_IN_FUNCTION : 'BuiltInFunctionExpression',
	DO                : 'DoExpression'
};
