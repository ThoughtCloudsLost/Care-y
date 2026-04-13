/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ alias: NonNullable<unknown> }} Ticket_Reply_Sheet_TitleInputs */

const en_ticket_reply_sheet_title = /** @type {(inputs: Ticket_Reply_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Reply to ${i?.alias}`)
};

const es_ticket_reply_sheet_title = /** @type {(inputs: Ticket_Reply_Sheet_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Responder a ${i?.alias}`)
};

/**
* | output |
* | --- |
* | "Reply to {alias}" |
*
* @param {Ticket_Reply_Sheet_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_title = /** @type {((inputs: Ticket_Reply_Sheet_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Sheet_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_sheet_title(inputs)
	return es_ticket_reply_sheet_title(inputs)
});