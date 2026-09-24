/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Reply_Sheet_MoreInputs */

const en_ticket_reply_sheet_more = /** @type {(inputs: Ticket_Reply_Sheet_MoreInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`and ${i?.count} more`)
};

const es_ticket_reply_sheet_more = /** @type {(inputs: Ticket_Reply_Sheet_MoreInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`y ${i?.count} más`)
};

const en_xa2_ticket_reply_sheet_more = /** @type {(inputs: Ticket_Reply_Sheet_MoreInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦ànd  ••${i?.count} mòrè ••⟧`)
};

/**
* | output |
* | --- |
* | "and {count} more" |
*
* @param {Ticket_Reply_Sheet_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_more = /** @type {((inputs: Ticket_Reply_Sheet_MoreInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Sheet_MoreInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_sheet_more(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_sheet_more(inputs)
	return en_ticket_reply_sheet_more(inputs)
});