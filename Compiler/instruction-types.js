const builtInOperation = {
  type: 'builtInOperation',
  destination: <register>,
  op: '+' | '-' | '/' | '*' | 'remainder',
  arg0: Number | <register>,
  arg1: Number | <register>
}

const copy = {
  type: 'copy',
  destination: <register>,
  value: Number | <register>
}

const halt = {
  type: 'halt'
}
