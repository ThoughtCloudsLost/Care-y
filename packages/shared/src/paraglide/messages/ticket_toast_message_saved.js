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

/**
* | output |
* | --- |
* | "Message updated" |
*
* @param {Ticket_Toast_Message_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_message_saved = /** @type {((inputs?: Ticket_Toast_Message_SavedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Message_SavedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_message_saved(inputs)
	return es_ticket_toast_message_saved(inputs)
});