/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Delete_NoteInputs */

const en_ticket_delete_note = /** @type {(inputs: Ticket_Delete_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete Note`)
};

const es_ticket_delete_note = /** @type {(inputs: Ticket_Delete_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar nota`)
};

/**
* | output |
* | --- |
* | "Delete Note" |
*
* @param {Ticket_Delete_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note = /** @type {((inputs?: Ticket_Delete_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Delete_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_delete_note(inputs)
	return es_ticket_delete_note(inputs)
});