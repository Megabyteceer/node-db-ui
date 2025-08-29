const throwError = (message: string): never => {
	/// #if DEBUG
	debugger;
	console.error(message);
	/// #endif
	throw new Error(message);
};

/// #if DEBUG
const assert = (condition: any, errorTxt: string) => {
	if (!condition) {
		throwError(errorTxt);
	}
};

const validateFieldName = (name: string) => {
	assert(!/[a-z]_/.test(name), 'wrong field name.');
};

const ESCAPE_BEGIN = '/*<Escape_detector*/';
const ESCAPE_END = '/*Escape_detector>*/';

/** detects path to pass sql injection. Not sql injections it self. */
const SQLInjectionsCheck = (query: string) => {
	const a = query.split(ESCAPE_BEGIN + '\'');
	for (const part of a) {
		const partA = part.split(ESCAPE_END);
		const str = partA.pop().replace(/[_a-zA-Z]\d+/gm, ''); // remove t122 and t_213 like entries
		if (str.includes('\'')) {
			throwError('query has text \'\' literal added with not escapeString() method. SQL injection detected: ' + str.substring(str.indexOf('\'')));
		}
		if (/\d/.test(str)) {
			throwError('query has text number literal added with not D() or A() method. SQL injection detected: ' + str.substring(/\d/.exec(str).index));
		}
	}
};

export { assert, ESCAPE_BEGIN, ESCAPE_END, SQLInjectionsCheck, throwError, validateFieldName };

/// #endif
