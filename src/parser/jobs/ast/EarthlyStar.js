import React, {Fragment} from 'react'
import {ActionLink} from 'components/ui/DbLink'

import ACTIONS from 'data/ACTIONS'
// import STATUSES from 'data/STATUSES'
import Module from 'parser/core/Module'

import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'

// Tiny module to count the number of early detonations on Earthly Star.
// TODO: Could expand to analyse Earthly Star usage, timing, overheal, etc - Sushi
export default class EarthlyStar extends Module {
	static handle = 'earthlystar'
	static title = 'Earthly Star'
	static dependencies = [
		'suggestions',
	]

	constructor(...args) {
		super(...args)

		// const earthlyFilter = {
		// 	by: 'player',
		// 	abilityId: [ACTIONS.EARTHLY_STAR.id, ACTIONS.STELLAR_DETONATION.id],
		// }

		const petFilter = {
			by: 'pet',
			abilityId: [ACTIONS.STELLAR_BURST.id, ACTIONS.STELLAR_EXPLOSION.id],
		}

		// const statusFilter = {
		// 	by: 'player',
		// 	abilityId: [STATUSES.EARTHLY_DOMINANCE.id, STATUSES.GIANT_DOMINANCE.id],
		// }

		this._earlyBurstCount = 0

		// this.addHook('cast', earthlyFilter, this._onCast)
		this.addHook('cast', petFilter, this._onPetCast)
		// this.addHook('applybuff', statusFilter, this._onDominance)

		this.addHook('complete', this._onComplete)
	}

	_onPetCast(event) {
		const actionID = event.ability.guid

		if (actionID === ACTIONS.STELLAR_BURST.id) {
			this._earlyBurstCount++
		}
	}

	_onComplete() {

		const earlyBurstCount = this._earlyBurstCount

		if (earlyBurstCount > 0) {

			this.suggestions.add(new Suggestion({
				icon: ACTIONS.STELLAR_DETONATION.icon,
				content: <Fragment>
					Plan your <ActionLink {...ACTIONS.EARTHLY_STAR} /> placements so that it's always cooked enough for the full potency when you need it.
				</Fragment>,
				severity: SEVERITY.MAJOR,
				why: <Fragment>
					{earlyBurstCount} instances of detonating an uncooked Earthly Star.
				</Fragment>,
			}))

		}
	}

}

