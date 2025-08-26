


declare const onCurdJSLogin: (userSession: import('../www/client-core/src/bs-utils').UserSession) => void;

declare const crudJs: { // helps to avoid circular imports
	customClasses: {
		[key: string]: typeof React.Component;
	};
	registerEventHandler: (classInstance) => void;
	Stage: typeof import('../www/client-core/src/stage').Stage;
}
