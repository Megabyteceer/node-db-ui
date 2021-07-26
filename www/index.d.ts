/// <reference path="../node_modules/pixi.js-legacy/pixi.js-legacy.d.ts" />
/// <reference path="../current-scene-typings.d.ts" />

import 'current-project-typings.js';
import Editor from 'thing-editor/js/editor/editor.js';
import game from 'thing-editor/js/engine/game.js';

import Container from '/thing-editor/js/engine/components/container.js';
import DisplayObject from '/thing-editor/js/engine/components/display-object.js';
import MovieClip from '/thing-editor/js/engine/components/movie-clip/movie-clip.js';

class TEditor extends Editor {
	game: typeof game;
	_root_initCalled: boolean;
	_root_onRemovedCalled: boolean;
}
import ReactDOM from "react-dom";
import React, { ComponentProps } from "react";


interface TReactDOM extends ReactDOM {
	div: (props: ComponentProps, ...children) => Comment
	form: (props: ComponentProps, ...children) => Comment

}

const TReact = typeof React;

declare global {
	const ReactDOM: TReactDOM;
	const React: TReact;
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