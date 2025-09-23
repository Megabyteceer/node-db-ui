import { clientOn } from '../../../../www/client-core/src/events-handle';
import { E } from '../types/generated';

clientOn(E._roles.onLoad, (form) => {
	form.addLookupFilters('_userRoles', 'excludeIDs', [1, 2, 3]);
	if (form.recId === 2 || form.recId === 3) {
		form.hideField('_userRoles');
	}
});
