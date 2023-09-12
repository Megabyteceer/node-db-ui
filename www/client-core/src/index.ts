import "reset-css/reset.css";
import "font-awesome/css/font-awesome.min.css";
import "react-datetime/css/react-datetime.css";
import "cropperjs/dist/cropper.min.css";
import "../css/consts.css";
import "../css/style.css";
/// #if DEBUG
import "../css/debug-style.css";
/// #endif

import "../css/animations.css";

import { MainFrame } from "./main-frame";
import "./fields/field-1-text-default";
import "./fields/field-2-numeric";
import "./fields/field-4-date-time";
import "./fields/field-5-bool";
import "./fields/field-6-enum";
import "./fields/field-7-many-to-one";
import "./fields/field-8-static-text";
import "./fields/field-10-password";
import "./fields/field-11-date";
import "./fields/field-12-picture";
import "./fields/field-14-many-to-many";
import "./fields/field-15-one-to-many";
import "./fields/field-16-rating";
import "./fields/field-18-button";
import "./fields/field-19-rich-editor";
import "./fields/field-20-color";
import "./fields/field-21-file";
import "./fields/field-22-splitter";
import "./views/view_5_users";
import { Stage } from "./stage";

import ReactDOM from 'react-dom';
import React from 'react';

import jQuery from 'jquery';
import { registerEventHandler } from './forms/event-processing-mixins';

/// #if DEBUG
import { AdminRolePrivilegesForm } from "./admin/admin-role-privileges-form";
import { DPromise } from "./debug-promise";
/// #endif

import { UserSession } from "./bs-utils";
import { FormEvents } from "./events/forms_events";
import { FieldsEvents } from "./events/fields_events";

declare global {
	interface Window {
		$: typeof jQuery;
		onCurdJSLogin: (userSession: UserSession) => void;
		crudJs: { // helps to avoid circular imports
			customClasses: {
				[key: string]: typeof React.Component;
			};
			registerEventHandler: (classInstance) => void;
			Stage: typeof Stage;
		}
	}
}

window.crudJs = {
	Stage,
	registerEventHandler,
	customClasses: {}
}

/// #if DEBUG

//@ts-ignore
window.Promise = DPromise;

window.crudJs.customClasses.AdminRolePrivilegesForm = AdminRolePrivilegesForm;
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



setTimeout(() => {
	window.crudJs.registerEventHandler(FormEvents);
	window.crudJs.registerEventHandler(FieldsEvents);
	ReactDOM.render(
		React.createElement(MainFrame),
		document.getElementById('container')
	);
}, 10);

