/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Detail_One_Message_StatInputs */

const en_ticket_detail_one_message_stat = /** @type {(inputs: Ticket_Detail_One_Message_StatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 message`)
};

const es_ticket_detail_one_message_stat = /** @type {(inputs: Ticket_Detail_One_Message_StatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 mensaje`)
};

const en_xa2_ticket_detail_one_message_stat = /** @type {(inputs: Ticket_Detail_One_Message_StatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦1 mèssàgè •••⟧`)
};

/**
* | output |
* | --- |
* | "1 message" |
*
* @param {Ticket_Detail_One_Message_StatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_one_message_stat = /** @type {((inputs?: Ticket_Detail_One_Message_StatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Detail_One_Message_StatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_detail_one_message_stat(inputs)
	if (locale === "en-XA") return en_xa2_ticket_detail_one_message_stat(inputs)
	return en_ticket_detail_one_message_stat(inputs)
});