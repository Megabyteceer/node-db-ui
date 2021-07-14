
export default class fieldLookupMixins extends React.Component {

	componentDidUpdate() {
		if(!this.state.filters) {
			this.setState({filters: this.generateDefaultFiltersByProps(this.props)});
			this.saveNodeDataAndFilters();
		}
	}

	generateDefaultFiltersByProps(props) {
		var ret = Object.assign({}, props.filters);

		var parentId = props.wrapper.props.form.props.initialData.id || props.wrapper.props.form.filters[props.field.fieldName] || 'new';

		if(props.field.fieldType === FIELD_17_TAB) {
			ret[props.field.fieldName + '_linker'] = parentId;
		}/* else {
			ret[props.field.fieldName] = parentId;
		}*/

		return ret;
	}

	saveNodeDataAndFilters(node, data, filters) {
		if(node) {
			this.savedNode = node;
		}
		this.savedData = data;
		this.savedFilters = filters;
	}

	setLookupFilter(filtersObjOrName, val) {
		if((typeof filtersObjOrName) === 'string') {
			if(this.state.filters[filtersObjOrName] !== val) {
				this.state.filters[filtersObjOrName] = val;
				this.forceUpdate();
			}
		} else {
			var leastOneUpdated;
			var keys = Object.keys(filtersObjOrName);
			for(var i = keys.length; i > 0;) {
				i--;
				var name = keys[i];
				var value = filtersObjOrName[name];
				if(this.state.filters[name] !== value) {
					this.state.filters[name] = value;
					leastOneUpdated = true;
				}
			}
			if(leastOneUpdated) {
				this.forceUpdate();
			}
		}
	}
}