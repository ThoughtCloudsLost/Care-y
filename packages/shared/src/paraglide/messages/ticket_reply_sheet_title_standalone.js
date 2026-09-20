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

const en_xa2_ticket_reply_sheet_title_standalone = /** @type {(inputs: Ticket_Reply_Sheet_Title_StandaloneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèply ••⟧`)
};

/**
* | output |
* | --- |
* | "Reply" |
*
* @param {Ticket_Reply_Sheet_Title_StandaloneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_title_standalone = /** @type {((inputs?: Ticket_Reply_Sheet_Title_StandaloneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Sheet_Title_StandaloneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_sheet_title_standalone(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_sheet_title_standalone(inputs)
	return en_ticket_reply_sheet_title_standalone(inputs)
});