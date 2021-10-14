module.exports = function (snowpackConfig, pluginOptions) {
	return {
		name: 'if-def-loader-snowpack',
		async transform({id, contents, isDev, fileExt}) {
			if(!isDev && (fileExt === '.ts' || fileExt === '.js')) {
				let a = contents.split('\n');
				let cut = 0;
				a = a.map((line) => {
					if(cut === 0) {
						if(line.trim() === '/// #if DEBUG') {
							cut++;
						}
					} else {
						if(line.trim() === '/// #endif') {
							cut--;
							if(cut < 0) {
								throw new Error('/// #endif without /// #if DEBUG in file ' + id + fileExt);
							}
						}
						line = '///'
					}
					return line;
				});
				if(cut > 0) {
					throw new Error('/// #if DEBUG without /// #endif in file ' + id + fileExt);
				}
				return a.join('\n');
			}
		},

	};
};