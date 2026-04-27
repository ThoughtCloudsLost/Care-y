/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Note_Hint_ParticipantsInputs */

const en_ticket_note_hint_participants = /** @type {(inputs: Ticket_Note_Hint_ParticipantsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`participants`)
};

const es_ticket_note_hint_participants = /** @type {(inputs: Ticket_Note_Hint_ParticipantsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`participantes`)
};

/**
* | output |
* | --- |
* | "participants" |
*
* @param {Ticket_Note_Hint_ParticipantsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_participants = /** @type {((inputs?: Ticket_Note_Hint_ParticipantsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Hint_ParticipantsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_note_hint_participants(inputs)
	return es_ticket_note_hint_participants(inputs)
});