/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Delete_Note_Confirm_BodyInputs */

const en_ticket_delete_note_confirm_body = /** @type {(inputs: Ticket_Delete_Note_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This note will be removed from the conversation. This cannot be undone.`)
};

const es_ticket_delete_note_confirm_body = /** @type {(inputs: Ticket_Delete_Note_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta nota se eliminará de la conversación. No se puede deshacer.`)
};

const en_xa2_ticket_delete_note_confirm_body = /** @type {(inputs: Ticket_Delete_Note_Confirm_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs nòtè wìll bè rèmòvèd fròm thè cònvèrsàtìòn. Thìs cànnòt bè ùndònè. ••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This note will be removed from the conversation. This cannot be undone." |
*
* @param {Ticket_Delete_Note_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_delete_note_confirm_body = /** @type {((inputs?: Ticket_Delete_Note_Confirm_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Delete_Note_Confirm_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_delete_note_confirm_body(inputs)
	if (locale === "en-XA") return en_xa2_ticket_delete_note_confirm_body(inputs)
	return en_ticket_delete_note_confirm_body(inputs)
});