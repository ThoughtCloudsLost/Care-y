/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_Message_SavedInputs */

const en_ticket_toast_message_saved = /** @type {(inputs: Ticket_Toast_Message_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message updated`)
};

const es_ticket_toast_message_saved = /** @type {(inputs: Ticket_Toast_Message_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje actualizado`)
};

const en_xa2_ticket_toast_message_saved = /** @type {(inputs: Ticket_Toast_Message_SavedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgè ùpdàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Message updated" |
*
* @param {Ticket_Toast_Message_SavedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_saved = /** @type {((inputs?: Ticket_Toast_Message_SavedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Message_SavedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_message_saved(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_message_saved(inputs)
	return en_ticket_toast_message_saved(inputs)
});