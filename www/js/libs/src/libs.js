// this files generates es module libraries used in the project, 
// to resolve them in development mode


/// #if DEBUG
window.Promise = undefined;
import Promise from "promise-polyfill";
window.Promise = Promise;
/// #endif

import React from "react";
import ReactDOM from "react-dom";

import jquery from "jquery";
import moment from "moment";
import Highlighter from "react-highlight-words";

import CodeMirror from "codemirror";
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/mode/javascript/javascript';
import ReactDatetimeClass from "react-datetime";
import ReactCropper from "react-cropper";

export {ReactCropper, jquery, Highlighter, React, ReactDOM, moment, CodeMirror, ReactDatetimeClass};

