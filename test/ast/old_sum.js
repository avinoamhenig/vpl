export default [
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
				{ "tag": "identifier", "name": "n" },
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
},
{	"name": "main", "args": [], "body": { "tag": "number", "val": 0 }}];
