import {getData, renderIcon, sp} from "../utils.js";

var style = {
	display: 'inline-block',
	marginTop: 17,
	width: 400,
	textAlign: 'right'

};

var inputStyle = {
	width: 240,
	borderRadius: 0,
	border: '1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	//		borderTop:'1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	//		borderBottom:'1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	color: '#fff',
	background: window.constants.BRAND_COLOR_SHADOW,
}
var imgStyle = {
	width: 40,
	height: 'auto',
	float: 'left',
	marginRight: 10
}

var labelStyle = {
	borderBottomLeftRadius: 4,
	borderTopLeftRadius: 4,
	padding: '2px 10px',
	height: 34,
	color: window.constants.BRAND_COLOR_LIGHT,
	verticalAlign: 'middle',
	display: 'inline-block',
	border: '1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	borderRight: 0
}


var clearBtnStyle = {
	borderBottomRightRadius: 4,
	borderTopRightRadius: 4,
	padding: '2px 10px',
	height: 34,
	color: window.constants.BRAND_COLOR_LIGHT,
	verticalAlign: 'middle',
	display: 'inline-block',
	border: '1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	borderLeft: 0
}

var resultsStyle = {
	display: 'block',
	width: 400,
	fontSize: '80%',
	textAlign: 'left',
	color: '#963',
	position: 'absolute',
	background: '#fffaf8',
	border: '#aa9988',
	zIndex: 10,
	boxShadow: '0px 4px 12px 0px #777'
}

var itemStyle = {
	display: 'block',
	padding: 10,
	borderBottom: '1px solid #db9'
}



export default class Search extends React.Component {

	clearTimeout() {
		if(this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = false;
		}
	}

	clearHideTimeout() {
		if(this.hiddingTimeout) {
			clearTimeout(this.hiddingTimeout);
			this.hiddingTimeout = false;
		}
	}

	onChange() {
		this.clearTimeout();
		this.timeout = setTimeout(() => {this.doSearch();}, 400);
	}

	doSearch() {
		this.clearTimeout();
		if(this.inputRef.value.length > 2) {
			this.setState({
				queryInProgress: true
			});
			getData('/custom/api/search', {
				s: this.inputRef.value
			}).then((data) => {
				this.setState({
					queryInProgress: false,
					data: data
				});

			});
		}
	}

	render() {

		var inputsProps = {
			style: inputStyle,
			title: 'Search',
			ref: (r) => {this.inputRef = r;},
			onChange: this.onChange
		};

		var waitIcon;
		if(this.state && this.state.queryInProgress) {
			waitIcon = renderIcon('cog fa-spin');
		}

		var results;
		if(this.state && this.state.data && !this.state.hidden) {

			if(this.state.data.length > 0) {


				results = ReactDOM.div({
					style: resultsStyle
				},
					this.state.data.map((i) => {

						var img;
						if(i.img) {

							img = ReactDOM.img({
								style: imgStyle,
								src: i.img
							});
						}



						return ReactDOM.span({
							style: itemStyle,
							className: 'clickable',
							href: '#',
							key: i.click,
							onClick: (ev) => {
								sp(ev);
								this.setState({
									data: undefined
								});
								this.inputRef.value = '';
								eval(i.click);
							}
						},
							img,
							ReactDOM.h5(null, i.name),
							i.desc.split('<br>').map((i, k) => {
								return ReactDOM.p({
									key: k
								}, i);
							})
						)
					})
				)
			} else {
				results = ReactDOM.div({
					style: resultsStyle
				},
					ReactDOM.div({
						style: {
							padding: '10px 20px',
							textAlign: 'center'
						}
					},
						'No results for request "' + this.inputRef.value + '".'
					)
				)
			}
		}

		return ReactDOM.span({
			style: style,
			onMouseLeave: () => {
				this.clearHideTimeout();
				this.hiddingTimeout = setTimeout(() => {
					this.setState({
						hidden: true
					})
				}, 800);
			},
			onMouseEnter: () => {
				this.clearHideTimeout();
				this.setState({
					hidden: false
				})
			}
		},
			waitIcon,
			ReactDOM.span({
				style: labelStyle
			}, 'Search: '),
			ReactDOM.input(inputsProps),
			ReactDOM.span({
				style: clearBtnStyle,
				className: 'clickable clickable-neg',
				onClick: () => {
					this.setState({
						data: undefined
					})
					this.inputRef.value = '';

				}
			}, renderIcon('times')),
			results
		);

	}
}