/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Add_Internal_NoteInputs */

const en_ticket_add_internal_note = /** @type {(inputs: Ticket_Add_Internal_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Internal Note`)
};

const es_ticket_add_internal_note = /** @type {(inputs: Ticket_Add_Internal_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nota interna`)
};

/**
* | output |
* | --- |
* | "Internal Note" |
*
* @param {Ticket_Add_Internal_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_add_internal_note = /** @type {((inputs?: Ticket_Add_Internal_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Add_Internal_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_add_internal_note(inputs)
	return es_ticket_add_internal_note(inputs)
});