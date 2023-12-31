// @ts-nocheck
import { Component } from "react";
import { R } from "../r";
import { renderIcon } from "../utils";

var chartLoaded = false;
var all = [];
var idCounter = 0;

var init = () => {
	// @ts-ignore
	if(typeof (google) !== 'undefined') {
		// @ts-ignore
		google.charts.load('current', {
			packages: ['corechart', 'line'],
			language: 'ru'
		});
		// @ts-ignore
		google.charts.setOnLoadCallback(() => {
			chartLoaded = true;
			for(let c of all) {
				c.forceUpdate();
			}
		});
	} else {
		setTimeout(init, 500);
	}
}
init();

class GoogleChart extends Component<any, any> {

	constructor(props) {
		super(props);
		this.chartId = 'google-chart' + idCounter;
		idCounter++;
		this.state = {};
	}

	componentDidMount() {
		all.push(this);

	}

	componentWillUnmount() {
		if(this.chart) {
			this.chart.clearChart();
		}
		all.splice(all.indexOf(this), 1);
	}

	setData(v) {
		this.setState({
			data: v
		});
	}

	render() {
		if(chartLoaded) {
			return R.div({
				id: this.chartId,
				className: 'chart-body',
				ref: (ref) => {
					// @ts-ignore
					var d = new google.visualization.DataTable();
					for(let c of this.props.columns.array) {
						d.addColumn(c[0], c[1]);
					}

					d.addRows(this.props.rows);

					if(this.props.formatter) {
						// @ts-ignore
						var f = new google.visualization.NumberFormat(this.props.formatter);
						f.format(d, 1);
					}
					if(!this.chart) {
						// @ts-ignore
						this.chart = new google.visualization.LineChart(document.getElementById(this.chartId));
					}
					this.chart.draw(d, this.props.options);
				}
			});
		} else return renderIcon('cog fa-spin');
	}
}