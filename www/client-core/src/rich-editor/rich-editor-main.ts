(async function () {
	await Promise.all([
		// @ts-ignore
		import('bootstrap/dist/css/bootstrap.min.css'),
		// @ts-ignore
		import('summernote/dist/summernote.min.css'),
		import('summernote/dist/summernote.min.js')
	]);

	window.Bootstrap = await import('bootstrap');
	window.Popper = await import('popper.js');

	const summernote = (document.querySelector('#summer-note') as any).summernote as (...params: any[]) => void;
	const iframeId = location.href.split('iframeId=').pop();

	window.addEventListener('message', (event) => {
		const data = event.data;

		if (data.hasOwnProperty('options')) {

			data.options.callbacks = {
				onInput: function (_contents, _$editable) {
					sendValueToParent();
				}
			};
			summernote(data.options);
		}
		if (data.hasOwnProperty('value')) {
			summernote('code', data.value);
		} else if (data.hasOwnProperty('onSaveRichEditor')) {
			sendValueToParent();
		}
	}, false);

	function sendValueToParent() {
		window.parent.postMessage({ id: iframeId, value: summernote('code') }, '*');
	}
	window.parent.postMessage({ id: iframeId }, '*');

})();
