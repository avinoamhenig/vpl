const getLambdaByName = (name, ast) => ast.filter(l => l.name === name)[0];
export default getLambdaByName;
