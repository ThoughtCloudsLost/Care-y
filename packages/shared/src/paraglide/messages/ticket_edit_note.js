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

const en_xa2_ticket_edit_note = /** @type {(inputs: Ticket_Edit_NoteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èdìt Nòtè •••⟧`)
};

/**
* | output |
* | --- |
* | "Edit Note" |
*
* @param {Ticket_Edit_NoteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_note = /** @type {((inputs?: Ticket_Edit_NoteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Edit_NoteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_edit_note(inputs)
	if (locale === "en-XA") return en_xa2_ticket_edit_note(inputs)
	return en_ticket_edit_note(inputs)
});