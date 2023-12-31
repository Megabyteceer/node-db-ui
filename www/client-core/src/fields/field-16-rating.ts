import { FIELD_TYPE } from "../bs-utils";
import { R } from "../r";
import { L } from "../utils";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE.RATING, class RatingField extends BaseField {

	setValue(val) {
		this.refToInput.value = val;
		//@ts-ignore
		this.state.value = val;
	}

	render() {
		if(this.state.value.all === 0) {
			return R.span(null,
				L('NO_RATES')
			);
		} else {
			var rate = parseFloat(this.state.value.rate.replace(',', '.'));
			var stars = [];
			for(var i = 1; i < 6; i++) {
				if(i <= (rate + 0.1)) {
					stars.push(R.p({ key: i, className: 'fa fa-star rating-star' }));
				} else if(i <= rate + 0.6) {
					stars.push(R.p({ key: i, className: 'fa fa-star-half-o rating-star' }));
				} else {
					stars.push(R.p({ key: i, className: 'fa fa-star-o rating-star' }));
				}
			}
			return R.span({ title: rate.toFixed(2) },
				stars,
				' (' + this.state.value.all + ')'
			);
		}
	}
});
