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

const en_xa2_ticket_add_internal_note = /** @type {(inputs: Ticket_Add_Internal_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìntèrnàl Nòtè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Internal Note" |
*
* @param {Ticket_Add_Internal_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_add_internal_note = /** @type {((inputs?: Ticket_Add_Internal_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Add_Internal_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_add_internal_note(inputs)
	if (locale === "en-XA") return en_xa2_ticket_add_internal_note(inputs)
	return en_ticket_add_internal_note(inputs)
});