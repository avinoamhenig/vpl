import unProcessAst from './unProcessAst'
import { main, stopEval } from 'exports?main,stopEval!../../evaluators/JSON-Interpreter-wCallbacks'

export const run = (ast, uponComplete, uponFail) => {
	const unProcessed = unProcessAst(ast);
	const entryExp = {
		tag: "call",
		function: { tag: "identifier", name: "main" },
		argVals: []
	};

	main(unProcessed.map(JSON.stringify),
		entryExp, uponComplete, uponFail);
};

export const stop = stopEval;
