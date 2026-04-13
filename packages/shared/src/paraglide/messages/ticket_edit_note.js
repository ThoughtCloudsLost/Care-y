/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Edit_NoteInputs */

const en_ticket_edit_note = /** @type {(inputs: Ticket_Edit_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Edit Note`)
};

const es_ticket_edit_note = /** @type {(inputs: Ticket_Edit_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Editar nota`)
};

/**
* | output |
* | --- |
* | "Edit Note" |
*
* @param {Ticket_Edit_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_note = /** @type {((inputs?: Ticket_Edit_NoteInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Edit_NoteInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_edit_note(inputs)
	return es_ticket_edit_note(inputs)
});