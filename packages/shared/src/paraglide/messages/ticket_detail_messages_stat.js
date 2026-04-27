/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Detail_Messages_StatInputs */

const en_ticket_detail_messages_stat = /** @type {(inputs: Ticket_Detail_Messages_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} messages`)
};

const es_ticket_detail_messages_stat = /** @type {(inputs: Ticket_Detail_Messages_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} mensajes`)
};

/**
* | output |
* | --- |
* | "{count} messages" |
*
* @param {Ticket_Detail_Messages_StatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_messages_stat = /** @type {((inputs: Ticket_Detail_Messages_StatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Detail_Messages_StatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_detail_messages_stat(inputs)
	return es_ticket_detail_messages_stat(inputs)
});