/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_Team_OnlyInputs */

const en_ticket_note_team_only = /** @type {(inputs: Ticket_Note_Team_OnlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Team only`)
};

const es_ticket_note_team_only = /** @type {(inputs: Ticket_Note_Team_OnlyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo equipo`)
};

/**
* | output |
* | --- |
* | "Team only" |
*
* @param {Ticket_Note_Team_OnlyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_team_only = /** @type {((inputs?: Ticket_Note_Team_OnlyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Team_OnlyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_team_only(inputs)
	return es_ticket_note_team_only(inputs)
});