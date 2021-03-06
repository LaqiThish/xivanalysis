import PropTypes from 'prop-types'
import React, {Component, Fragment} from 'react'
import withSizes from 'react-sizes'
import {Accordion, Icon, Progress} from 'semantic-ui-react'

import {MOBILE_BREAKPOINT} from 'components/STYLE_CONSTS'
import {TARGET} from 'parser/core/modules/Checklist/Rule'

import styles from './Checklist.module.css'

const RULE_STYLES = {
	[TARGET.SUCCESS]: {text: 'text-success', color: 'green', icon: 'checkmark', autoExpand: false},
	[TARGET.WARN]: {text: 'text-warning', color: 'yellow', icon: 'warning sign', autoExpand: true},
	[TARGET.FAIL]: {text: 'text-error', color: 'red', icon: 'remove', autoExpand: true},
}

class Checklist extends Component {
	static propTypes = {
		rules: PropTypes.arrayOf(PropTypes.shape({
			percent: PropTypes.number.isRequired,
			tier: PropTypes.oneOf(Object.values(TARGET)),
			name: PropTypes.node.isRequired,
			requirements: PropTypes.arrayOf(PropTypes.shape({
				name: PropTypes.node.isRequired,
				content: PropTypes.string.isRequired,
			})),
		})),
		hideProgress: PropTypes.bool.isRequired,
	}

	render() {
		const {rules, hideProgress} = this.props

		// If there's no rules, just stop now
		if (!rules.length) { return false }

		const expanded = []
		const panels = rules.map((rule, index) => {
			const ruleStyles = RULE_STYLES[rule.tier]

			if (ruleStyles.autoExpand) {
				expanded.push(index)
			}
			return {
				// This should be a handle of some sort
				key: index,
				title: {
					className: styles.title,
					content: <Fragment>
						<Icon
							name={ruleStyles.icon}
							className={ruleStyles.text}
						/>
						{rule.name}
						<div className={styles.percent + ' ' + ruleStyles.text}>
							{rule.percent.toFixed(1)}%
							{hideProgress || <Progress
								percent={rule.percent}
								className={styles.progress}
								size="small"
								color={ruleStyles.color}
							/>}
						</div>
					</Fragment>,
				},
				content: {
					content: <Fragment>
						{rule.description && <div className={styles.description}>
							<Icon name="info" size="large" />
							<p>{rule.description}</p>
						</div>}
						{/* TODO: Better styling for these requirements */}
						<ul>
							{rule.requirements.map((requirement, index) =>
								<li key={index}>
									{requirement.name}: {requirement.content}
								</li>
							)}
						</ul>
					</Fragment>,
				},
			}
		})

		return <Accordion
			exclusive={false}
			panels={panels}
			defaultActiveIndex={expanded}
			styled fluid
		/>
	}
}

const mapSizesToProps = ({width}) => ({
	hideProgress: width < MOBILE_BREAKPOINT,
})

export default withSizes(mapSizesToProps)(Checklist)
