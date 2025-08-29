// @ts-nocheck
import { Component } from 'react';
import { getData, L, renderIcon, sp } from '../utils';

const style = {
	display: 'inline-block',
	marginTop: 17,
	width: 400,
	textAlign: 'right'

};

const inputStyle = {
	width: 240,
	borderRadius: 0,
	border: '1px solid ' + BRAND_COLOR_LIGHT,
	//		borderTop:'1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	//		borderBottom:'1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	color: '#fff',
	background: window.constants.BRAND_COLOR_SHADOW,
};
const imgStyle = {
	width: 40,
	height: 'auto',
	float: 'left',
	marginRight: 10
};

const clearBtnStyle = {
	borderBottomRightRadius: 4,
	borderTopRightRadius: 4,
	padding: '2px 10px',
	height: 34,
	color: window.constants.BRAND_COLOR_LIGHT,
	verticalAlign: 'middle',
	display: 'inline-block',
	border: '1px solid ' + window.constants.BRAND_COLOR_LIGHT,
	borderLeft: 0
};

const resultsStyle = {
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
};

const itemStyle = {
	display: 'block',
	padding: 10,
	borderBottom: '1px solid #db9'
};


export default class Search extends Component<any, any> {

	clearTimeout() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			this.timeout = false;
		}
	}

	clearHideTimeout() {
		if (this.hidingTimeout) {
			clearTimeout(this.hidingTimeout);
			this.hidingTimeout = false;
		}
	}

	onChange() {
		this.clearTimeout();
		this.timeout = setTimeout(() => { this.doSearch(); }, 400);
	}

	doSearch() {
		this.clearTimeout();
		if (this.inputRef.value.length > 2) {
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

		const inputsProps = {
			style: inputStyle,
			title: 'Search',
			placeholder: L('SEARCH'),
			ref: (r) => { this.inputRef = r; },
			onChange: this.onChange
		};

		let waitIcon;
		if (this.state && this.state.queryInProgress) {
			waitIcon = renderIcon('cog fa-spin');
		}

		let results;
		if (this.state && this.state.data && !this.state.hidden) {

			if (this.state.data.length > 0) {


				results = R.div({
					style: resultsStyle
				},
				this.state.data.map((i) => {

					let img;
					if (i.img) {

						img = R.img({
							style: imgStyle,
							src: i.img
						});
					}


					return R.span({
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
					R.h5(null, i.name),
					i.description.split('<br>').map((i, k) => {
						return R.p({
							key: k
						}, i);
					})
					);
				})
				);
			} else {
				results = R.div({
					style: resultsStyle
				},
				R.div({
					style: {
						padding: '10px 20px',
						textAlign: 'center'
					}
				},
				'No results for request "' + this.inputRef.value + '".'
				)
				);
			}
		}

		return R.span({
			style: style,
			onMouseLeave: () => {
				this.clearHideTimeout();
				this.hidingTimeout = setTimeout(() => {
					this.setState({
						hidden: true
					});
				}, 800);
			},
			onMouseEnter: () => {
				this.clearHideTimeout();
				this.setState({
					hidden: false
				});
			}
		},
		waitIcon,
		R.input(inputsProps),
		R.span({
			style: clearBtnStyle,
			className: 'clickable clickable-neg',
			onClick: () => {
				this.setState({
					data: undefined
				});
				this.inputRef.value = '';

			}
		}, renderIcon('times')),
		results
		);

	}
}
