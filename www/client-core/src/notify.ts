import { Component } from 'preact';
import { R } from './r';

let instance;

let stack = [];
let idCounter = 0;

class Notify extends Component<{
	// props
},
{
	// state
}> {
	componentDidMount() {
		instance = this;
	}

	static add(content) {
		instance.add(content);
	}

	add(content) {
		const id = idCounter++;
		if (content) {
			stack.push({ content: content, id: id });
		}
		setTimeout(() => {
			this.hideById(id);
		}, 10000);
		this.forceUpdate();
	}

	hideById(id) {
		stack = stack.filter((i) => {
			return i.id !== id;
		});
		this.forceUpdate();
	}

	render() {
		if (stack.length > 0) {
			return R.div({ className: 'notify-area' },
				stack.map((m) => {
					return R.div({
						key: m.id, className: 'fade-in notify-block', onClick: () => {
							this.hideById(m.id);
						}
					},
					m.content.split('\n').map((l, i) => {
						return R.div({ key: i }, l);
					})
					);
				})
			);
		} else {
			return R.span();
		}
	}
}
export { Notify };
