import React from "react";


interface ComponentProps {
	className?: string;
	onClick?: Function;
	[key: string]: any;
}

class R {
	static div: (props?: ComponentProps, ...children) => React.Component;
	static form: (props?: ComponentProps, ...children) => React.Component;
	static span: (props?: ComponentProps, ...children) => React.Component;
	static p: (props?: ComponentProps, ...children) => React.Component;
	static img: (props?: ComponentProps, ...children) => React.Component;
	static button: (props?: ComponentProps, ...children) => React.Component;
	static input: (props?: ComponentProps, ...children) => React.Component;
	static label: (props?: ComponentProps, ...children) => React.Component;
	static b: (props?: ComponentProps, ...children) => React.Component;
	static a: (props?: ComponentProps, ...children) => React.Component;
	static br: (props?: ComponentProps, ...children) => React.Component;
	static hr: (props?: ComponentProps, ...children) => React.Component;
	static svg: (props?: ComponentProps, ...children) => React.Component;
	static td: (props?: ComponentProps, ...children) => React.Component;
	static tr: (props?: ComponentProps, ...children) => React.Component;
	static th: (props?: ComponentProps, ...children) => React.Component;
	static tbody: (props?: ComponentProps, ...children) => React.Component;
	static thead: (props?: ComponentProps, ...children) => React.Component;
	static table: (props?: ComponentProps, ...children) => React.Component;
	static polyline: (props?: ComponentProps, ...children) => React.Component;
	static textarea: (props?: ComponentProps, ...children) => React.Component;
	static iframe: (props?: ComponentProps, ...children) => React.Component;
	static h2: (props?: ComponentProps, ...children) => React.Component;
	static h3: (props?: ComponentProps, ...children) => React.Component;
	static h4: (props?: ComponentProps, ...children) => React.Component;
	static h5: (props?: ComponentProps, ...children) => React.Component;
}

for(let factoryType of ['div', 'form', 'span', 'p', 'img', 'button', 'input', 'label',
	'b', 'a', 'br', 'hr', 'svg', 'td', 'tr', 'th', 'tbody', 'thead', 'table', 'polyline',
	'textarea', 'iframe', 'h2', 'h3', 'h4', 'h5']) {
	R[factoryType] = (...theArgs) => {
		return React.createElement.call(this, factoryType, ...theArgs);
	};
}

export { R, ComponentProps };
