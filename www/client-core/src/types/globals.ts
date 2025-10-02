import type { ComponentType } from 'preact';
import type { UserSession } from '../../../../core/auth';
import type TabField from '../form-tab';
import type { FormTabContent } from '../form-tab';
import type { Stage } from '../stage';

declare global {
	interface Window {
		onCurdJSLogin: (userSession: UserSession) => void;
		onGoogleSignIn: (googleUser: any) => void;
		Bootstrap: any;
		Popper: any;
	}
}

interface Globals {
	/** SERVER SIDE */
	nodesByTableName?: Map<string, NodeDesc>;
	customClasses: {
		[key: string]: ComponentType<any>;
	};
	Stage: typeof Stage;
	FormTabContent: typeof FormTabContent;
	TabField: typeof TabField;
}

export const globals: Globals = {} as any;