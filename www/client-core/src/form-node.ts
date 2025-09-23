import { Component, type ComponentChildren } from 'preact';
import { SAVE_REJECTED } from './consts';
import type Form from './form';
import { R } from './r';
import waitForCondition from './wait-for-condition';

export interface FormNodeProps {
	parent?: FormNode;
	parentForm: Form;
}

export interface FormNodeState {

}

// @ts-ignore
export interface FormNodeAccessor extends FormNode {
	// @ts-ignore
	beforeFocus(): Promise<void>;
	// @ts-ignore
	beforeAlert(isSuccess: boolean): Promise<void>;
}

export default class FormNode<T1 extends FormNodeProps = FormNodeProps, T2 extends FormNodeState = FormNodeState> extends Component<T1, T2> {

	parent?: FormNode;
	parentForm?: Form;
	children: FormNode[] = [];

	isDataModified = false;

	constructor(props: T1) {
		super(props);
		this.parent = props.parent;
		this.parentForm = props.parentForm;
		if (this.parent) {
			this.parent.children.push(this);
		}
	}

	async beforeSave(): Promise<void> {
		if (this.children.length) {
			return Promise.all(this.children.map(c => c.beforeSave())) as any;
		}
	}

	async afterSave(): Promise<void> {
		if (this.children.length) {
			return Promise.all(this.children.map(c => c.afterSave())) as any;
		}
	}

	isValid(): typeof SAVE_REJECTED | undefined {

		let ret = undefined as typeof SAVE_REJECTED | undefined;
		for (const c of this.children) {
			if (c.isValid()) {
				ret = SAVE_REJECTED;
			}
		}
		return ret;
	}

	invalidateData() {
		this.isDataModified = true;
		this.parent?.invalidateData();
	}

	async beforeFocus() {
		await this.parent?.beforeFocus();
	}

	async forceBouncingTimeout(): Promise<void> {
		if (this.children.length) {
			return Promise.all(this.children.map(c => c.forceBouncingTimeout())) as any;
		}
	}

	private async beforeAlert(isSuccess: boolean) {
		await this.parent?.beforeAlert(isSuccess);
	}

	asyncOpsInProgress = 0;

	waitForAsyncFinish() {
		return waitForCondition(() => !this.isAsyncInProgress());
	}

	isAsyncInProgress(): boolean {
		return (this.asyncOpsInProgress || this.children.some(c => c.isAsyncInProgress())) as any;
	}

	getDomElement() {
		return this.base as HTMLDivElement;
	}

	render(): ComponentChildren {
		return R.fragment();
	}
}