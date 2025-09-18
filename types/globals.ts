import type { ComponentType } from 'preact';
import type { UserSession } from '../core/auth';
import type { FormTabContent, TabField } from '../www/client-core/src/form-tab';
import type { Stage } from '../www/client-core/src/stage';

declare global {
	interface Window {
		onCurdJSLogin: (userSession: UserSession) => void;
		onGoogleSignIn: (googleUser: any) => void;
		Bootstrap: any;
		Popper: any;
	}
}

interface Globals {
	customClasses: {
		[key: string]: ComponentType<any>;
	};
	Stage: typeof Stage;
	FormTabContent: typeof FormTabContent;
	TabField: typeof TabField;
}

export const globals: Globals = {} as any;