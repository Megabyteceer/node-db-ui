import type { Component } from 'react';
import type { UserSession } from '../core/auth';
import type { Stage } from '../www/client-core/src/stage';

interface Globals {
	onCurdJSLogin: (userSession: UserSession) => void;
	customClasses: {
		[key: string]: Component;
	};
	registerEventHandler: (classInstance) => void;
	Stage: typeof Stage;
}

export const globals: Globals = {} as any;