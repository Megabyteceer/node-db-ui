import { Component, type ComponentChildren } from 'preact';
import { assert } from './assert';
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
		for (const c of this.children) {
			await c.beforeSave();
		}
	}

	async afterSave(): Promise<void> {
		for (const c of this.children) {
			await c.afterSave();
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
		for (const c of this.children) {
			await c.forceBouncingTimeout();
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

	componentWillUnmount(): void {
		const c = this.parent?.children;
		if (c) {
			const i = c.indexOf(this);
			assert(i >= 0, 'Wrong child detected');
			c.splice(i, 1);
		}
	}

	getDomElement() {
		return this.base as HTMLDivElement;
	}

	render(): ComponentChildren {
		return R.fragment();
	}
}