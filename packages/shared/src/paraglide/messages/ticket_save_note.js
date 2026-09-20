/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Save_NoteInputs */

const en_ticket_save_note = /** @type {(inputs: Ticket_Save_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save note`)
};

const es_ticket_save_note = /** @type {(inputs: Ticket_Save_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar nota`)
};

const en_xa2_ticket_save_note = /** @type {(inputs: Ticket_Save_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè nòtè •••⟧`)
};

/**
* | output |
* | --- |
* | "Save note" |
*
* @param {Ticket_Save_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_save_note = /** @type {((inputs?: Ticket_Save_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Save_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_save_note(inputs)
	if (locale === "en-XA") return en_xa2_ticket_save_note(inputs)
	return en_ticket_save_note(inputs)
});