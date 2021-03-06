/**
 * @author Yumiya
 */

import React, {Fragment} from 'react'
import {StatusLink} from 'components/ui/DbLink'
import ACTIONS from 'data/ACTIONS'
import STATUSES from 'data/STATUSES'
import Module from 'parser/core/Module'
import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'

export default class SongUptime extends Module {
	static handle = 'songuptime'
	static dependencies = [
		'suggestions',
		'downtime',
	]

	_songCastEvents = []
	_deathEvents = []

	constructor(...args) {
		super(...args)

		this.addHook('cast', {
			by: 'player',
			abilityId: [ACTIONS.THE_WANDERERS_MINUET.id, ACTIONS.MAGES_BALLAD.id, ACTIONS.ARMYS_PAEON.id],
		}, this._onSongCast)
		this.addHook('death', {
			to: 'player',
		}, this._onDeath)
		this.addHook('complete', this._onComplete)
	}

	_onSongCast(event) {
		this._songCastEvents.push(event)
	}

	_onDeath(event) {
		this._deathEvents.push(event)
	}

	_onComplete() {

		const fightDuration = (this.parser.fightDuration - this.downtime.getDowntime())/1000
		const songlessTime = (this._getSonglessTime())/1000
		const songlessPercentile = (songlessTime/fightDuration)*100

		//TODO: Define a threshold for song uptime
		if (songlessPercentile > 3) {
			this.suggestions.add(new Suggestion({
				icon: ACTIONS.THE_WANDERERS_MINUET.icon,
				why: `Being songless for ${songlessTime} seconds (${songlessPercentile}%)`,
				severity: songlessPercentile > 7 ? SEVERITY.MAJOR : songlessPercentile > 5? SEVERITY.MEDIUM : SEVERITY.MINOR,
				content: <Fragment>
					Try not to be songless during uptime. Bard's core mechanics revolve around its songs and the added effects they bring. Your songs also apply a <StatusLink {...STATUSES.CRITICAL_UP}/> buff to your party.
				</Fragment>,
			}))
		}
	}

	_getSonglessTime() {

		let totalSonglessTime = 0

		// Iterate through each song cast
		for (let i = 0; i < this._songCastEvents.length; i++) {

			// Timestamps for songless period to be determined
			const songless = {start: 0, end: 0}

			// If this is the last song cast in the encounter, caster is songless until the end of encounter, otherwise songless until the next song is cast
			if (i === this._songCastEvents.length - 1) {
				songless.end = this.parser.fight.end_time
			} else {
				songless.end = this._songCastEvents[i+1].timestamp
			}

			// The start of a songless period can't be after the end of said period, só it's the minimum between the end of first song and end of assumed songless period
			songless.start = Math.min(this._songCastEvents[i].timestamp + 30000, songless.end)

			// If caster died after first song was cast
			const deathEvent = this._deathEvents.find(d => d.timestamp > this._songCastEvents[i].timestamp)

			// If death was before the theoretical songless period
			if (deathEvent ? deathEvent.timestamp < songless.start : false) {
				// Then death marks the start of the songless period
				songless.start = deathEvent.timestamp
			}

			// Just in case it's negative, but it shouldn't be given the previous logic
			const theoreticalSonglessTime =  Math.max(songless.end - songless.start, 0)

			// If there's songless time between two songs, subtracts the amount of time the target was invulnerable during that interval
			if (theoreticalSonglessTime > 0) {
				const effectiveSonglessTime = Math.max(theoreticalSonglessTime - this.downtime.getDowntime(songless.start, songless.end), 0)
				totalSonglessTime += effectiveSonglessTime
			}
		}

		return totalSonglessTime
	}

}
