/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Reply_Sheet_MoreInputs */

const en_ticket_reply_sheet_more = /** @type {(inputs: Ticket_Reply_Sheet_MoreInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`and ${i?.count} more`)
};

const es_ticket_reply_sheet_more = /** @type {(inputs: Ticket_Reply_Sheet_MoreInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`y ${i?.count} mas`)
};

/**
* | output |
* | --- |
* | "and {count} more" |
*
* @param {Ticket_Reply_Sheet_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_more = /** @type {((inputs: Ticket_Reply_Sheet_MoreInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Sheet_MoreInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_sheet_more(inputs)
	return es_ticket_reply_sheet_more(inputs)
});