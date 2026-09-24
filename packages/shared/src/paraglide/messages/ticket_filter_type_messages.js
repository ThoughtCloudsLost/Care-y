/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_MessagesInputs */

const en_ticket_filter_type_messages = /** @type {(inputs: Ticket_Filter_Type_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Messages`)
};

const es_ticket_filter_type_messages = /** @type {(inputs: Ticket_Filter_Type_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes`)
};

const en_xa2_ticket_filter_type_messages = /** @type {(inputs: Ticket_Filter_Type_MessagesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mèssàgès •••⟧`)
};

/**
* | output |
* | --- |
* | "Messages" |
*
* @param {Ticket_Filter_Type_MessagesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_messages = /** @type {((inputs?: Ticket_Filter_Type_MessagesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_MessagesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_messages(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_messages(inputs)
	return en_ticket_filter_type_messages(inputs)
});