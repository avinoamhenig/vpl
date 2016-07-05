const {
	createTypeDefinition,
	createUid
} = require('../../app/ast');

module.exports = () => {
	const typeDefinitions = {};
	const constructors = {};
	const typeVariables = {};
	return {
		typeDefinitions, constructors, typeVariables,
		newTypeDefinition(name, defFn) {
			const uid = createUid();
			const newDef = defFn(uid);
			typeDefinitions[name] = createTypeDefinition(
				name, newDef.constructors, newDef.parameters, uid
			);
			Object.assign(constructors, ...newDef.constructors.map(c => ({
				[c.displayName]: c
			})));
			Object.assign(typeVariables, ...newDef.parameters.map(v => ({
				[v.id]: v
			})));
		}
	};
};
