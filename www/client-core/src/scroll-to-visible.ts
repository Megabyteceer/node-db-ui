import type { Component } from 'preact';

export const shakeDomElement = (e: HTMLDivElement) => {
	if (e) {
		e.classList.remove('shake');
		// access to property to apply class animation hack
		e.offsetWidth; // eslint-disable-line @typescript-eslint/no-unused-expressions
		e.classList.add('shake');
		window.setTimeout(() => {
			e.classList.remove('shake');
		}, 600);
	}
};

export const scrollToVisible = (elem: Component | HTMLDivElement, doNotShake = false) => {
	if (elem) {
		const element = (elem as Component).base as HTMLDivElement || elem;
		if ((element as any).scrollIntoViewIfNeeded) {
			(element as any).scrollIntoViewIfNeeded(false);
		} else {
			element.scrollIntoView();
		}
		if (!doNotShake) {
			shakeDomElement(element);
		}
	}
};