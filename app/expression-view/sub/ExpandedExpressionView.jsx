import React from 'react'
import name from 'lib/name'
import Radium from 'radium'
import { compose } from 'redux'
import computeStyles from '../expressionViewStyles'
import ExpressionView from '../ExpressionView'
import { LambdaView } from 'lambda-view'
import $ from 'jquery'
import debounce from 'lodash/debounce'
import {
	getNode
} from 'ast'

@Radium
export default class ExpandedExpressionView extends React.Component {
	render () {
		const p = this.props;
		const s = computeStyles(p);

		return (
			<span>
				<div ref="arrow" style={s.arrow}></div>
				<div ref="popup"
				     style={s.expandedContainer}
				     onClick={e => e.stopPropagation()}>
					{ p.expandedFn
						? (
							<LambdaView
								{...p}
								lambdaId={p.identifier.value}
								expansionLevel={p.expansionLevel + 1}
								hideButtons={true}
								/>
						)
						: (
							<ExpressionView
								{...p}
								nestedLevel={0}
								expansionLevel={p.expansionLevel + 1}
								/>
						)
					}
				</div>
			</span>
		);
	}

	componentDidMount() {
		const p = this.props;
		const popup = $(this.refs.popup);
		const arrow = $(this.refs.arrow);
		const arrowHeight = arrow.outerHeight();
		const arrowWidth = arrow.outerWidth();
		const container = p.containerId
			? $(p.containerId)
			: $(`#exp_cont_${p.lambdaIdentId}_${p.expansionLevel}`);
		console.log(container[0]);
		const parent = popup.parent().parent();
		const cusion = 5;
		const offsetTop = p.popupOffsetTop || 0;

		this._handleResize = function () {
			const contOffset = container.offset();
			const parentOffset = parent.offset();
			popup.offset({
				left: contOffset.left + cusion,
				top: parentOffset.top + parent.outerHeight() + offsetTop
			}).width(container.width() - (cusion * 2));
			arrow.offset({
				left: parentOffset.left + (parent.outerWidth() / 2) - (arrowWidth/2),
				top: parent.offset().top + parent.outerHeight() + offsetTop - arrowHeight
			});
		};
		this.handleResize = debounce(this._handleResize, 100);

		$(window).on('resize.popupContainerSizing', this.handleResize);
		this._handleResize();
	}

	componentDidUpdate() {
		this._handleResize();
	}

	componentWillUnmount() {
		$(window).off('resize', this.handleResize);
	}
}
