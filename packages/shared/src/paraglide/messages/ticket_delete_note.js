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

const en_xa2_ticket_delete_note = /** @type {(inputs: Ticket_Delete_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè Nòtè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete Note" |
*
* @param {Ticket_Delete_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note = /** @type {((inputs?: Ticket_Delete_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Delete_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_delete_note(inputs)
	if (locale === "en-XA") return en_xa2_ticket_delete_note(inputs)
	return en_ticket_delete_note(inputs)
});