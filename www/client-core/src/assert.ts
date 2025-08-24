const throwError = (message: string): never => {
	/// #if DEBUG
	debugger;
	/// #endif
	throw new Error(message);
}

/// #if DEBUG
const assert = (condition: any, errorTxt: string) => {
	if(!condition) {
		throwError(errorTxt);
	}
}

const validateFieldName = (name: string) => {
	assert(!/[^a-z_]/.test(name), 'wrong field name.');
}

export { assert, throwError, validateFieldName };
