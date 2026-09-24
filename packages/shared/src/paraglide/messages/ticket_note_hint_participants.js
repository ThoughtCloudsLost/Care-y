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

const en_xa2_ticket_note_hint_participants = /** @type {(inputs: Ticket_Note_Hint_ParticipantsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦pàrtìcìpànts ••••⟧`)
};

/**
* | output |
* | --- |
* | "participants" |
*
* @param {Ticket_Note_Hint_ParticipantsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_note_hint_participants = /** @type {((inputs?: Ticket_Note_Hint_ParticipantsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Note_Hint_ParticipantsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_note_hint_participants(inputs)
	if (locale === "en-XA") return en_xa2_ticket_note_hint_participants(inputs)
	return en_ticket_note_hint_participants(inputs)
});