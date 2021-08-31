$(async function () {
	//@ts-ignore
	window.Bootstrap = await import("bootstrap");
	//@ts-ignore
	window.Popper = await import("popper.js");

	var s = $('#summernote');
	var iframeId = location.href.split('iframeId=').pop();

	window.addEventListener("message", (event) => {

		var data = event.data;

		if (data.hasOwnProperty('options')) {

			data.options.callbacks = {
				onChange: function (contents, $editable) {
					sendValueToParent();
				}
			};
			//@ts-ignore
			s.summernote(data.options);
		}
		if (data.hasOwnProperty('value')) {
			//@ts-ignore
			s.summernote('code', data.value);
		} else if (data.hasOwnProperty('onSaveRichEditor')) {
			sendValueToParent();
		}
	}, false);

	function sendValueToParent() {
		//@ts-ignore
		window.parent.postMessage({ id: iframeId, value: s.summernote('code') }, '*');
	}
	window.parent.postMessage({ id: iframeId }, '*');

});