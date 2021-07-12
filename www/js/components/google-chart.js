import {renderIcon} from "../utils.js";

var chartLoaded = false;
var all = [];
var idCunter=0;

var init = () => {
	if(typeof(google) !=='undefined'){
		google.charts.load('current', {packages: ['corechart', 'line'], language:'ru'});
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

class GoogleChart extends React.Component {

	constructor (props) {
		super(props);
		this.chartId = 'google-chart' + idCunter;
		idCunter++;
		this.state = {};
	}
	
	componentDidMount(){
		all.push(this);
		
	}

	componentWillUnmount() {
		if(this.chart){
			this.chart.clearChart();
		}
		all.splice(all.indexOf(this), 1);
	}
	
	setData(v) {
		this.setState({data:v});
	}
	
	render() {
		if (chartLoaded) {
			return ReactDOM.div({id:this.chartId, className:'chart-body', ref:(ref) => {
				var d = new google.visualization.DataTable();
				for(let c of this.props.columns.array) {
					d.addColumn(c[0],c[1]);
				}

				d.addRows(this.props.rows);
				
				if (this.props.formatter) {
					var f = new google.visualization.NumberFormat(this.props.formatter);
					f.format(d, 1);
				}
				if(!this.chart){
					this.chart = new google.visualization.LineChart(document.getElementById(this.chartId));
				}
				this.chart.draw(d, this.props.options);
			}
			});
		} else return renderIcon('cog fa-spin');
	}
}