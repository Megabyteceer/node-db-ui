
import R from "react-dom";
import React, { Component as C, Component } from "react";
import { moment as m } from "moment";

interface ComponentProps {
	className?: string;
	onClick?: Function;
	[key: string]: any;
}

interface TR {
	div: (props: ComponentProps = null, ...children) => Component;
	form: (props: ComponentProps = null, ...children) => Component;
	span: (props: ComponentProps = null, ...children) => Component;
	p: (props: ComponentProps = null, ...children) => Component;
	img: (props: ComponentProps = null, ...children) => Component;
	button: (props: ComponentProps = null, ...children) => Component;
	input: (props: ComponentProps = null, ...children) => Component;
	label: (props: ComponentProps = null, ...children) => Component;
	b: (props: ComponentProps = null, ...children) => Component;
	a: (props: ComponentProps = null, ...children) => Component;
	br: (props: ComponentProps = null, ...children) => Component;
	hr: (props: ComponentProps = null, ...children) => Component;
	svg: (props: ComponentProps = null, ...children) => Component;
	td: (props: ComponentProps = null, ...children) => Component;
	tr: (props: ComponentProps = null, ...children) => Component;
	th: (props: ComponentProps = null, ...children) => Component;
	tbody: (props: ComponentProps = null, ...children) => Component;
	thead: (props: ComponentProps = null, ...children) => Component;
	table: (props: ComponentProps = null, ...children) => Component;
	polyline: (props: ComponentProps = null, ...children) => Component;
	textarea: (props: ComponentProps = null, ...children) => Component;
	iframe: (props: ComponentProps = null, ...children) => Component;
	h2: (props: ComponentProps = null, ...children) => Component;
	h3: (props: ComponentProps = null, ...children) => Component;
	h4: (props: ComponentProps = null, ...children) => Component;
	h5: (props: ComponentProps = null, ...children) => Component;
}

const TReact = typeof React;

declare global {
	const moment = m;
	const Datetime;
	const Component = C;
	const ReactDOM: TReactDOM;
	const React: TReact;
	const R: TR;
	let currentUserData: any;
	let currentFormParameters: any;
	let __corePath: string;

	interface Window {
		reloadParentIfSomethingUpdated_qwi012d: Function;
		ReactCropper: any;
		currentUserData: any;
		currentFormParameters: any;
		__corePath: string;
	}

	function assert(expression: boolean, message?: string);

	function isUserHaveRole(params: Number);

	const ADMIN_ROLE_ID = 1;
	const GUEST_ROLE_ID = 2;
	const USER_ROLE_ID = 3;


	const FIELD_1_TEXT = 1;
	const FIELD_2_INT = 2;
	const FIELD_4_DATETIME = 4;
	const FIELD_5_BOOL = 5;
	const FIELD_6_ENUM = 6;
	const FIELD_7_Nto1 = 7;
	const FIELD_8_STATICTEXT = 8;
	const FIELD_10_PASSWORD = 10;
	const FIELD_11_DATE = 11;
	const FIELD_12_PICTURE = 12;
	const FIELD_14_NtoM = 14;
	const FIELD_15_1toN = 15;
	const FIELD_16_RATING = 16;
	const FIELD_17_TAB = 17;
	const FIELD_18_BUTTON = 18;
	const FIELD_19_RICHEDITOR = 19;
	const FIELD_20_COLOR = 20;
	const FIELD_21_FILE = 21;

	const PREVS_VIEW_OWN = 1;
	const PREVS_VIEW_ORG = 2;
	const PREVS_VIEW_ALL = 4;
	const PREVS_CREATE = 8;
	const PREVS_EDIT_OWN = 16;
	const PREVS_EDIT_ORG = 32;
	const PREVS_EDIT_ALL = 64;
	const PREVS_DELETE = 128;
	const PREVS_PUBLISH = 256;
	const PREVS_ANY = 65535;
}