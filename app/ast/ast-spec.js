const VERSION = 2.2;

const Program = {
  astType     : TYPE_NAME,
  expression  : Uid(Expression),
  nodes       : {[Uid]:Node},
  identifiers : {[Uid]:Identifier}
};

const ProgramFragment = {
  astType     : TYPE_NAME,
  rootNode    : Uid(Node),
  nodes       : {[Uid]:Node},
  identifiers : {[Uid]:Identifier}
};

const Identifier = {
  astType     : TypeName,
  id          : NewUid(),
  displayName : nullable(String),
  scope       : nullable(Uid(Node)),
  value       : nullable(Uid(Expression))
};

const Node = {
  nodeType          : noOverride(TypeName),
  id                : NewUid,
  parent            : nullable(Uid(Node)),
  displayName       : nullable(String),
  boundIdentifiers : [Uid(Node)],
  ...sub(
    Expression,
    CaseBranch,
    ElseBranch
  )
};

const Expression = {
  ...extend(Node),
  nodeType       : noOverride(TypeName),
  expressionType : TypeName,
  ...sub(
    NumberExpression,
    IdentifierExpression,
    LambdaExpression,
    ApplicationExpression,
    CaseExpression
  )
};

const NumberExpression = {
  ...extend(Expression),
  value : Number
};

const IdentifierExpression = {
  ...extend(Expression),
  identifier : Uid(Identifier)
};

const LambdaExpression = {
  ...extend(Expression),
  arguments  : [Uid(Identifier)],
  body       : Uid(Expression)
};

const ApplicationExpression = {
  ...extend(Expression),
  lambda    : Uid(Expression),
  arguments : [Uid(Expression)]
};

const CaseExpression = {
  ...extend(Expression),
  caseBranches : nonempty([Uid(CaseBranch)]),
  elseBranch  : Uid(ElseBranch)
};

const CaseBranch = {
  ...extend(Node),
  condition  : Uid(Expression),
  expression : Uid(Expression)
};

const ElseBranch = {
  ...extend(Node),
  expression : Uid(Expression)
};
