const G = {
  PC : 0,
  continue : true,
  symbolTable : {}
}

const instructionType = {
  COPY: 'copy',
  HALT: 'halt',
  BUILT_IN_OP: 'builtInOperation'
}

const opType = {
  ADD : '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
  REMAINDER: 'remainder'
}

const one = [{ type: 'copy',
              destination: 't0',
              value: 2
            }
,{ type: 'copy',
              destination: 't1',
              value: 3
            }
, { type: 'builtInOperation',
                destination: 't2',
                op: '+',
                arg0: 't0',
                arg1: 't1'
              }
,{ type: 'halt'}]


const testExpression = ["copy t0 2", "copy t1 3", "add t2 t0 t1", "halt"];

function interpret(code) {
  var instruction = 0;
  while (G.continue && G.PC < code.length) {
    instruction = code[G.PC];
    switch (instruction.type) {
      case instructionType.COPY:
        const dest = instruction.destination;
        var value = get(instruction.value);
        put(dest, value);
        break;

      case instructionType.HALT:
        G.continue = false;
        break;

      case instructionType.BUILT_IN_OP:
        builtInOperation(instruction);
        break;
    }
    advancePC();
  }
  console.log(G.symbolTable);
}

function builtInOperation(instruction) {
  switch (instruction.op) {
    case opType.ADD:
      var result = get(instruction.arg0) + get(instruction.arg1);
      break;
  }
  put(instruction.destination, result);
}

function put(destination, value) {
  G.symbolTable[destination] = value;
}

function get(identifier) {
  if (Number(identifier) || identifier == '0') {
    return Number(identifier);
  } else {
    return G.symbolTable[identifier];
  }

}

function advancePC() {
  G.PC += 1;
}

module.exports = {interpret};
