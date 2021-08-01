import("./libs/libs.js").then((libs) => {
	// @ts-ignore
	window.React = libs.React;
	// @ts-ignore
	window.ReactDOM = libs.ReactDOM;
	// @ts-ignore
	window.Component = libs.React.Component;
	// @ts-ignore
	window.$ = libs.jquery;
	import('./entry.js');
});