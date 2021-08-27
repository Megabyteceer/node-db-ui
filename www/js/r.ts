import React from "react";

interface Component {

}

interface ComponentProps {
	className?: string;
	onClick?: Function;
	[key: string]: any;
}

class R {
	div: (props: ComponentProps | null, ...children) => Component;
	form: (props: ComponentProps | null, ...children) => Component;
	span: (props: ComponentProps | null, ...children) => Component;
	p: (props: ComponentProps | null, ...children) => Component;
	img: (props: ComponentProps | null, ...children) => Component;
	button: (props: ComponentProps | null, ...children) => Component;
	input: (props: ComponentProps | null, ...children) => Component;
	label: (props: ComponentProps | null, ...children) => Component;
	b: (props: ComponentProps | null, ...children) => Component;
	a: (props: ComponentProps | null, ...children) => Component;
	br: (props: ComponentProps | null, ...children) => Component;
	hr: (props: ComponentProps | null, ...children) => Component;
	svg: (props: ComponentProps | null, ...children) => Component;
	td: (props: ComponentProps | null, ...children) => Component;
	tr: (props: ComponentProps | null, ...children) => Component;
	th: (props: ComponentProps | null, ...children) => Component;
	tbody: (props: ComponentProps | null, ...children) => Component;
	thead: (props: ComponentProps | null, ...children) => Component;
	table: (props: ComponentProps | null, ...children) => Component;
	polyline: (props: ComponentProps | null, ...children) => Component;
	textarea: (props: ComponentProps | null, ...children) => Component;
	iframe: (props: ComponentProps | null, ...children) => Component;
	h2: (props: ComponentProps | null, ...children) => Component;
	h3: (props: ComponentProps | null, ...children) => Component;
	h4: (props: ComponentProps | null, ...children) => Component;
	h5: (props: ComponentProps | null, ...children) => Component;
}

for (let factoryType of ['div', 'form', 'span', 'p', 'img', 'button', 'input', 'label',
	'b', 'a', 'br', 'hr', 'svg', 'td', 'tr', 'th', 'tbody', 'thead', 'table', 'polyline',
	'textarea', 'iframe', 'h2', 'h3', 'h4', 'h5']) {
	R[factoryType] = (...theArgs) => {
		return React.createElement.call(this, factoryType, ...theArgs);
	};
}

export { R };