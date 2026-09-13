/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_Sheet_Title_StandaloneInputs */

const en_ticket_reply_sheet_title_standalone = /** @type {(inputs: Ticket_Reply_Sheet_Title_StandaloneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reply`)
};

const es_ticket_reply_sheet_title_standalone = /** @type {(inputs: Ticket_Reply_Sheet_Title_StandaloneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Responder`)
};

/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Ticket_Reply_Sheet_Title_StandaloneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_title_standalone = /** @type {((inputs?: Ticket_Reply_Sheet_Title_StandaloneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Sheet_Title_StandaloneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_reply_sheet_title_standalone(inputs)
	return es_ticket_reply_sheet_title_standalone(inputs)
});