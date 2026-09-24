/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Delete_Note_Confirm_TitleInputs */

const en_ticket_delete_note_confirm_title = /** @type {(inputs: Ticket_Delete_Note_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete Note`)
};

const es_ticket_delete_note_confirm_title = /** @type {(inputs: Ticket_Delete_Note_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar nota`)
};

const en_xa2_ticket_delete_note_confirm_title = /** @type {(inputs: Ticket_Delete_Note_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè Nòtè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Delete Note" |
*
* @param {Ticket_Delete_Note_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note_confirm_title = /** @type {((inputs?: Ticket_Delete_Note_Confirm_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Delete_Note_Confirm_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_delete_note_confirm_title(inputs)
	if (locale === "en-XA") return en_xa2_ticket_delete_note_confirm_title(inputs)
	return en_ticket_delete_note_confirm_title(inputs)
});