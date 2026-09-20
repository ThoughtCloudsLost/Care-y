/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Edit_Message_Too_LongInputs */

const en_ticket_edit_message_too_long = /** @type {(inputs: Ticket_Edit_Message_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This message is too long.`)
};

const es_ticket_edit_message_too_long = /** @type {(inputs: Ticket_Edit_Message_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este mensaje es muy largo.`)
};

const en_xa2_ticket_edit_message_too_long = /** @type {(inputs: Ticket_Edit_Message_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs mèssàgè ìs tòò lòng. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This message is too long." |
*
* @param {Ticket_Edit_Message_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_edit_message_too_long = /** @type {((inputs?: Ticket_Edit_Message_Too_LongInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Edit_Message_Too_LongInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_edit_message_too_long(inputs)
	if (locale === "en-XA") return en_xa2_ticket_edit_message_too_long(inputs)
	return en_ticket_edit_message_too_long(inputs)
});