// import 'cropperjs/dist/cropper.min.css'; TODO

import 'font-awesome/css/font-awesome.min.css';
// import 'react-datetime/css/react-datetime.css'; TODO
import 'reset-css/reset.css';
import '../css/consts.css';
import '../css/style.css';
/// #if DEBUG
import '../css/debug-style.css';
/// #endif

import '../css/animations.css';

import './fields/field-1-text-default';
import './fields/field-14-many-to-many';
import './fields/field-15-one-to-many';
import './fields/field-2-numeric';
import './fields/field-4-date-time';
import './fields/field-5-bool';
import './fields/field-6-enum';
import './fields/field-7-many-to-one';

import './fields/field-10-password';
import './fields/field-11-date';
import './fields/field-12-picture';

import './fields/field-18-button';
import './fields/field-19-rich-editor';

import './fields/field-20-color';
import './fields/field-21-file';
import './fields/field-22-splitter';
import './fields/field-8-static-text';

import { Stage } from './stage';
import './views/view_users';

/// #if DEBUG
import { AdminRolePrivilegesForm } from './admin/admin-role-privileges-form';
/// #endif

import { globals } from './types/globals';

globals.Stage = Stage;

globals.customClasses = {};

/// #if DEBUG
globals.customClasses.AdminRolePrivilegesForm = AdminRolePrivilegesForm;
/// #endif

import { h, render } from 'preact';
import { clientOn } from './events-handle';
import './events/index';
import './form-tab';
import { MainFrame } from './main-frame';
import { E } from './types/generated';

export const renderApp = () => {
	render(h(MainFrame, null), document.getElementById('container') as HTMLDivElement);
};

export { clientOn, E };
