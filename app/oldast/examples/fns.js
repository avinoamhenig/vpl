export default [
	{	"name": "main", "args": [], "body": { "tag": "number", "val": 0 } },
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
	{"body": {"elseExp": {"elseExp": {"function": {"name": "odd-factor", "tag": "identifier"}, "argVals": [{"name": "n", "tag": "identifier"}, {"function": {"name": "+", "tag": "identifier"}, "argVals": [{"name": "i", "tag": "identifier"}, {"val": "2", "tag": "number"}], "tag": "call"}], "tag": "call"}, "cases": [{"exp": {"name": "n", "tag": "identifier"}, "condition": {"function": {"name": ">", "tag": "identifier"}, "argVals": [{"function": {"name": "*", "tag": "identifier"}, "argVals": [{"name": "i", "tag": "identifier"}, {"name": "i", "tag": "identifier"}], "tag": "call"}, {"name": "n", "tag": "identifier"}], "tag": "call"}}], "tag": "case"}, "cases": [{"exp": {"name": "i", "tag": "identifier"}, "condition": {"function": {"name": "=", "tag": "identifier"}, "argVals": [{"val": "0", "tag": "number"}, {"function": {"name": "modulo", "tag": "identifier"}, "argVals": [{"name": "n", "tag": "identifier"}, {"name": "i", "tag": "identifier"}], "tag": "call"}], "tag": "call"}}], "tag": "case"}, "name": {"name": "odd-factor", "tag": "identifier"}, "args": ["n", "i"]},

	{"body": {"elseExp": {"function": {"name": "odd-factor", "tag": "identifier"}, "argVals": [{"name": "n", "tag": "identifier"}, {"val": "3", "tag": "number"}], "tag": "call"}, "cases": [{"exp": {"val": "2", "tag": "number"}, "condition": {"function": {"name": "=", "tag": "identifier"}, "argVals": [{"val": "0", "tag": "number"}, {"function": {"name": "modulo", "tag": "identifier"}, "argVals": [{"name": "n", "tag": "identifier"}, {"val": "2", "tag": "number"}], "tag": "call"}], "tag": "call"}}], "tag": "case"}, "name": {"name": "find-smallest-factor", "tag": "identifier"}, "args": ["n"]},

	{"body": {"function": {"name": "=", "tag": "identifier"}, "argVals": [{"name": "n", "tag": "identifier"}, {"function": {"name": "find-smallest-factor", "tag": "identifier"}, "argVals": [{"name": "n", "tag": "identifier"}], "tag": "call"}], "tag": "call"}, "name": {"name": "definitely-prime?", "tag": "identifier"}, "args": ["n"]}
];
