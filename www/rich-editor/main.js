$(function () {
	window.exports = {};
	window.module = {};
	Promise.all([
		import('../js/lib/bootstrap/dist/js/bootstrap.js').then((m) => {
			window.Bootstrap = window.module.exports;
		}),
		import('../js/lib/@popperjs/core/dist/umd/popper.js').then((m) => {
			window.Popper = window.exports;
		})
	]).then(() => {

		var s = $('#summernote');
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
			window.parent.postMessage({id: iframeId, value: s.summernote('code')}, '*');
		}
		window.parent.postMessage({id: iframeId}, '*');
	});
});