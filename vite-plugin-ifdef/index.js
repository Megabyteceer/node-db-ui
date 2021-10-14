const fileRegex = /\.(ts)$/

module.exports = function vitePluginIfDef() {
	return {
		name: 'vite-plugin-ifdef',
		enforce: 'pre',
		transform(src, id) {
			if(fileRegex.test(id)) {

				let a = src.split('\n');
				let cut = 0;
				a = a.map((line) => {
					var trimmedLine = line.trim();
					if(trimmedLine.startsWith('window.crudJs.assert(')) {
						return '///' + line;
					}
					if(cut === 0) {
						if(trimmedLine === '/// #if DEBUG') {
							cut++;
						}
					} else {
						if(trimmedLine === '/// #endif') {
							cut--;
							if(cut < 0) {
								throw new Error('/// #endif without /// #if DEBUG in file ' + id + fileExt);
							}
						}
						line = '///' + line;
					}
					return line;
				});
				if(cut > 0) {
					throw new Error('/// #if DEBUG without /// #endif in file ' + id + fileExt);
				}

				return {
					code: a.join('\n'),
					map: null // provide source map if available
				}
			}
		}
	}
}
