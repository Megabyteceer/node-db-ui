
import R from "react-dom";
import React, { Component as C, Component } from "react";


interface TR {
	div: (props: ComponentProps, ...children) => Component;
	form: (props: ComponentProps, ...children) => Component;
	span: (props: ComponentProps, ...children) => Component;
	p: (props: ComponentProps, ...children) => Component;
	img: (props: ComponentProps, ...children) => Component;
	button: (props: ComponentProps, ...children) => Component;
	input: (props: ComponentProps, ...children) => Component;
	label: (props: ComponentProps, ...children) => Component;
	b: (props: ComponentProps, ...children) => Component;
	a: (props: ComponentProps, ...children) => Component;
	br: (props: ComponentProps, ...children) => Component;
	hr: (props: ComponentProps, ...children) => Component;
	svg: (props: ComponentProps, ...children) => Component;
	td: (props: ComponentProps, ...children) => Component;
	tr: (props: ComponentProps, ...children) => Component;
	th: (props: ComponentProps, ...children) => Component;
	tbody: (props: ComponentProps, ...children) => Component;
	thead: (props: ComponentProps, ...children) => Component;
	table: (props: ComponentProps, ...children) => Component;
	polyline: (props: ComponentProps, ...children) => Component;
	textarea: (props: ComponentProps, ...children) => Component;
	iframe: (props: ComponentProps, ...children) => Component;
	h2: (props: ComponentProps, ...children) => Component;
	h3: (props: ComponentProps, ...children) => Component;
	h4: (props: ComponentProps, ...children) => Component;
	h5: (props: ComponentProps, ...children) => Component;
}

const TReact = typeof React;

declare global {
	const Component = C;
	const ReactDOM: TReactDOM;
	const React: TReact;
	const R: TR;
	function assert(expression: boolean, message?: string, errorCode?: number);
	function __getNodeExtendData(node: Container): any;
	function __EDITOR_editableProps(constructor: new () => T, fields: EditableFieldDescription[]): void;

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