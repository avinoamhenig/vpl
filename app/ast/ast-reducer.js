import processAst from './processAst.js'

const jsonAst = [
	{	"name": "sum",
		"args": ["n"],
		"body": {
			"tag": "case",
			"cases": [{
				"condition": {
					"tag": "call",
					"function": { "tag": "identifier", "name": "=" },
					"argVals": [
						{ "tag": "identifier", "name": "n" },
						{ "tag": "number", "val": 0 }
					]
				},
				"exp": { "tag": "number", "val": 0 }
			}],
			"elseExp": {
				"tag": "call",
				"function": { "tag": "identifier", "name": "+" },
				"argVals": [
					{ "tag": "number", "val": 1 },
					{	"tag": "call",
						"function": { "tag": "identifier", "name": "sum" },
						"argVals": [{
							"tag": "call",
							"function":  { "tag": "identifier", "name": "-" },
							"argVals": [
								{ "tag": "identifier", "name": "n" },
								{ "tag": "number", "val": 1 }
							]
						}]
					}
				]
			}
		}
	}
];

const processed = processAst(jsonAst);

const astReducer = (state = processed, action) => {
	return state;
};

export default astReducer;
