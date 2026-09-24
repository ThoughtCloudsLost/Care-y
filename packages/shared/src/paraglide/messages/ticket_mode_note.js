/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Mode_NoteInputs */

const en_ticket_mode_note = /** @type {(inputs: Ticket_Mode_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`NOTE`)
};

const es_ticket_mode_note = /** @type {(inputs: Ticket_Mode_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`NOTA`)
};

const en_xa2_ticket_mode_note = /** @type {(inputs: Ticket_Mode_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦NÒTÈ ••⟧`)
};

/**
* | output |
* | --- |
* | "NOTE" |
*
* @param {Ticket_Mode_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_mode_note = /** @type {((inputs?: Ticket_Mode_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Mode_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_mode_note(inputs)
	if (locale === "en-XA") return en_xa2_ticket_mode_note(inputs)
	return en_ticket_mode_note(inputs)
});