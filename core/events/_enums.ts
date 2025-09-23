import { serverOn } from '../../www/client-core/src/events-handle';
import { E } from '../../www/client-core/src/types/generated';
import { shouldBeAdmin } from '../admin/admin';
import { reloadMetadataSchedule } from '../describe-node';

serverOn(E._enums.afterCreate, async (_data, userSession) => {
	shouldBeAdmin(userSession);
	reloadMetadataSchedule();
});