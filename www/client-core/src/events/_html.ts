import { clientOn } from '../../../../www/client-core/src/events-handle';
import { E } from '../types/generated';
import { removeWrongCharactersInField } from './_nodes';

clientOn(E._html.title.onChange, (form) => {
	removeWrongCharactersInField(form, 'title');
	const href =
		location.protocol +
		'//' +
		location.host +
		'/custom/html/' +
		form.getFieldValue('title') +
		'.html';
	form.setFieldValue('link', href);

	const e: HTMLDivElement = form.base as HTMLDivElement;
	(e.querySelector('.clickable-link') as HTMLAnchorElement).href = href;
	(e.querySelector('.clickable-link-text') as HTMLAnchorElement).innerText = href;
});
