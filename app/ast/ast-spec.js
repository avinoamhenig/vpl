const VERSION = 3.0;

const Program = {
  astType         : TYPE_NAME,
  expression      : Uid(Expression),
  nodes           : {[Uid]:Node},
  identifiers     : {[Uid]:Identifier},
  constructors    : {[Uid]:Constructor},
  typeDefinitions : {[Uid]:TypeDefinition},
  typeVariables   : {[Uid]:TypeVariable}
};

const ProgramFragment = {
  astType         : TYPE_NAME,
  rootNode        : Uid(Node),
  nodes           : {[Uid]:Node},
  identifiers     : {[Uid]:Identifier},
  constructors    : {[Uid]:Constructor},
  typeDefinitions : {[Uid]:TypeDefinition},
  typeVariables   : {[Uid]:TypeVariable}
};

const Identifier = {
  astType     : TypeName,
  id          : NewUid(),
  displayName : String,
  scope       : nullable(Uid(Node)),
  value       : nullable(Uid(Expression))
};

const Constructor = {
  astType       : TypeName,
  id            : NewUid(),
  displayName   : String,
  argumentTypes : [Uid(Type)],
  parentType    : Uid(TypeDefinition)
};

const TypeDefinition = {
  astType      : TypeName,
  id           : NewUid(),
  displayName  : String,
  constructors : nonempty([Uid(Constructor)]),
  arguments    : [Uid(TypeVariable)]
};

const TypeVariable = {
  astType     : TypeName,
  id          : NewUid(),
  displayName : nullable(String)
};

const Type = {
  astType        : TypeName,
  id             : NewUid(),
  displayName    : nullable(String),
  typeDefinition : Uid(any(TypeDefinition, TypeVariable)),
  arguments      : [Type]
};

const Node = {
  nodeType         : noOverride(TypeName),
  id               : NewUid,
  parent           : nullable(Uid(Node)),
  displayName      : nullable(String),
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
  type           : Type,
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

const ConstructionExpression = {
  ...extend(Expression),
  constructor : Uid(Constructor),
  arguments   : [Uid(Expression)]
};

const DefaultExpression = {
  ...extend(Expression)
};
