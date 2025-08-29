import React from "react";


interface ComponentProps {
	className?: string;
	onClick?: (ev:MouseEvent) => void;
	[key: string]: any;
}

class R {
	static div: (props?: ComponentProps, ...children) => React.ReactElement;
	static form: (props?: ComponentProps, ...children) => React.ReactElement;
	static span: (props?: ComponentProps, ...children) => React.ReactElement;
	static p: (props?: ComponentProps, ...children) => React.ReactElement;
	static img: (props?: ComponentProps, ...children) => React.ReactElement;
	static button: (props?: ComponentProps, ...children) => React.ReactElement;
	static input: (props?: ComponentProps, ...children) => React.ReactElement;
	static label: (props?: ComponentProps, ...children) => React.ReactElement;
	static b: (props?: ComponentProps, ...children) => React.ReactElement;
	static a: (props?: ComponentProps, ...children) => React.ReactElement;
	static br: (props?: ComponentProps, ...children) => React.ReactElement;
	static hr: (props?: ComponentProps, ...children) => React.ReactElement;
	static svg: (props?: ComponentProps, ...children) => React.ReactElement;
	static td: (props?: ComponentProps, ...children) => React.ReactElement;
	static tr: (props?: ComponentProps, ...children) => React.ReactElement;
	static th: (props?: ComponentProps, ...children) => React.ReactElement;
	static tbody: (props?: ComponentProps, ...children) => React.ReactElement;
	static thead: (props?: ComponentProps, ...children) => React.ReactElement;
	static table: (props?: ComponentProps, ...children) => React.ReactElement;
	static polyline: (props?: ComponentProps, ...children) => React.ReactElement;
	static textarea: (props?: ComponentProps, ...children) => React.ReactElement;
	static iframe: (props?: ComponentProps, ...children) => React.ReactElement;
	static h2: (props?: ComponentProps, ...children) => React.ReactElement;
	static h3: (props?: ComponentProps, ...children) => React.ReactElement;
	static h4: (props?: ComponentProps, ...children) => React.ReactElement;
	static h5: (props?: ComponentProps, ...children) => React.ReactElement;
	static script: (props?: ComponentProps, ...children) => React.ReactElement;
	static meta: (props?: ComponentProps, ...children) => React.ReactElement;
}

for(const factoryType of ['div', 'form', 'span', 'p', 'img', 'button', 'input', 'label',
	'b', 'a', 'br', 'hr', 'svg', 'td', 'tr', 'th', 'tbody', 'thead', 'table', 'polyline',
	'textarea', 'iframe', 'h2', 'h3', 'h4', 'h5', 'script', 'meta']) {
	R[factoryType] = (...theArgs) => {
		return React.createElement.call(this, factoryType, ...theArgs);
	};
}

export { ComponentProps, R };

