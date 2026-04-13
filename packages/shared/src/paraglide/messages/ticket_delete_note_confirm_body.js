/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Delete_Note_Confirm_BodyInputs */

const en_ticket_delete_note_confirm_body = /** @type {(inputs: Ticket_Delete_Note_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This note will be removed from the conversation. This cannot be undone.`)
};

const es_ticket_delete_note_confirm_body = /** @type {(inputs: Ticket_Delete_Note_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta nota se eliminara de la conversacion. No se puede deshacer.`)
};

/**
* | output |
* | --- |
* | "This note will be removed from the conversation. This cannot be undone." |
*
* @param {Ticket_Delete_Note_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note_confirm_body = /** @type {((inputs?: Ticket_Delete_Note_Confirm_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Delete_Note_Confirm_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_delete_note_confirm_body(inputs)
	return es_ticket_delete_note_confirm_body(inputs)
});