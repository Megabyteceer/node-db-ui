const waits = [] as {
	resolve: () => void;
	condition: () => boolean;
}[];

const waitForCondition = (condition: () => any) => {
	if (condition()) {
		return;
	}
	return new Promise((resolve) => {
		waits.push({
			resolve: resolve as any,
			condition
		});
	});
};

setInterval(() => {
	while (waits.length) {
		if (waits[0].condition()) {
			waits.shift()!.resolve();
		} else {
			break;
		}
	}
}, 20);

export default waitForCondition;
