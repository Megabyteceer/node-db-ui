import MainFrame from "./main-frame.js";
import "./fields/field-1-text-default.js";
import "./fields/field-2-numeric.js";
import "./fields/field-4-datetime.js";
import "./fields/field-5-bool.js";
import "./fields/field-6-enum.js";
import "./fields/field-7-nto1.js";
import "./fields/field-8-static-text.js";
import "./fields/field-10-password.js";
import "./fields/field-11-date.js";
import "./fields/field-12-picture.js";
import "./fields/field-14-n2m.js";
import "./fields/field-15-12n.js";
import "./fields/field-16-rating.js";
import "./fields/field-17-compact-area.js";
import "./fields/field-18-button.js";
import "./fields/field-19-rich-ditor.js";
import "./fields/field-20-color.js";
import "./fields/field-21-file.js";
import "./views/view_5_users.js";


import ReactDOM from 'react-dom';
import React from 'react';

/// #if DEBUG
import AdminRoleprevsForm from "./admin/admin-roleprevs-form.js";

// @ts-ignore
window.AdminRoleprevsForm = AdminRoleprevsForm;
/*
/// #endif
window.onerror = (msg, url, line, col, error) => {
		var stack;
		try {
			stack = error.stack;
		} catch(e){};
		submitErrorReport(msg, stack);
	};
//*/

interface Component {

}

interface ComponentProps {
	className?: string;
	onClick?: Function;
	[key: string]: any;
}

interface TR {
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


window.addEventListener('load', () => {
	ReactDOM.render(
		React.createElement(MainFrame),
		document.getElementById('container')
	);
});
