import {renderIcon} from "../utils.js";


var chartLoaded = false;
var all = [];
var idCunter=0;

var init = function(){
	if(typeof(google) !=='undefined'){
		google.charts.load('current', {packages: ['corechart', 'line'], language:'ru'});
		google.charts.setOnLoadCallback(function(){
			chartLoaded = true;
			all.map(function(c){
				c.forceUpdate();
			});
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


	
	setData:function(v) {
		this.setState({data:v});
	},
	
	render:function() {

		if (chartLoaded) {
			
			return ReactDOM.div({id:this.chartId, className:'chart-body', ref:function(ref){
				
				var d = new google.visualization.DataTable();
				
				this.props.columns.map(function(c){
					d.addColumn(c[0],c[1]);
				})

				d.addRows(this.props.rows);
				
				if (this.props.formatter) {
					var f = new google.visualization.NumberFormat(this.props.formatter);
					f.format(d, 1);
				}
				
				
				if(!this.chart){
					this.chart = new google.visualization.LineChart(document.getElementById(this.chartId));
				}
				
				
				
				this.chart.draw(d, this.props.options);
				
				
				
				
				
				
			}.bind(this)
				
			});
			
			
		} else return renderIcon('cog fa-spin');
	}
}