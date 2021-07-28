import {L} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var starStyle = {
	color: '#F54223',
	marginLeft: 0,
	marginRight: 0
}

registerFieldClass(FIELD_16_RATING, class RatingField extends fieldMixins {

	setValue(val) {
		this.refToInput.value = val;
		this.state.value = val;
	}

	render() {
		if(this.state.value.all === 0) {
			return R.span(null,
				L('NORATES')
			);
		} else {
			var rate = parseFloat(this.state.value.rate.replace(',', '.'));
			var stars = [];
			for(var i = 1; i < 6; i++) {
				if(i <= (rate + 0.1)) {
					stars.push(R.p({key: i, style: starStyle, className: 'fa fa-star'}));
				} else if(i <= rate + 0.6) {
					stars.push(R.p({key: i, style: starStyle, className: 'fa fa-star-half-o'}));
				} else {
					stars.push(R.p({key: i, style: starStyle, className: 'fa fa-star-o'}));
				}
			}
			return R.span({title: rate.toFixed(2)},
				stars,
				' (' + this.state.value.all + ')'
			);
		}
	}
});
