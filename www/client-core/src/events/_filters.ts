import { clientOn } from '../../../../www/client-core/src/events-handle';
import { E } from '../types/generated';

clientOn(E._filters.onLoad, (form) => {
	form.addLookupFilters('nodeFiltersLinker', {
		filterId: 8,
		excludeIDs: [9]
	});
});