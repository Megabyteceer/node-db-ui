import jQuery from 'jquery';
//@ts-ignore
window.jQuery = jQuery;
window.$ = jQuery;
$(async function () {
	await Promise.all([
		//@ts-ignore
		import("bootstrap/dist/css/bootstrap.min.css"),
		//@ts-ignore
		import("summernote/dist/summernote.min.css"),
		//@ts-ignore
		import("summernote/dist/summernote.min.js")
	]);

	//@ts-ignore
	window.Bootstrap = await import("bootstrap");
	//@ts-ignore
	window.Popper = await import("popper.js");

	//@ts-ignore
	var s: { summernote: (...params: any[]) => void } = $('#summer-note');
	var iframeId = location.href.split('iframeId=').pop();

	window.addEventListener("message", (event) => {
		var data = event.data;

		if(data.hasOwnProperty('options')) {

			data.options.callbacks = {
				onChange: function (contents, $editable) {
					sendValueToParent();
				}
			};
			s.summernote(data.options);
		}
		if(data.hasOwnProperty('value')) {
			s.summernote('code', data.value);
		} else if(data.hasOwnProperty('onSaveRichEditor')) {
			sendValueToParent();
		}
	}, false);

	function sendValueToParent() {
		window.parent.postMessage({ id: iframeId, value: s.summernote('code') }, '*');
	}
	window.parent.postMessage({ id: iframeId }, '*');

});