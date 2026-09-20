/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Reply_Sheet_PlaceholderInputs */

const en_ticket_reply_sheet_placeholder = /** @type {(inputs: Ticket_Reply_Sheet_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Type a message...`)
};

const es_ticket_reply_sheet_placeholder = /** @type {(inputs: Ticket_Reply_Sheet_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe un mensaje...`)
};

const en_xa2_ticket_reply_sheet_placeholder = /** @type {(inputs: Ticket_Reply_Sheet_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Typè à mèssàgè... ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Type a message..." |
*
* @param {Ticket_Reply_Sheet_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_reply_sheet_placeholder = /** @type {((inputs?: Ticket_Reply_Sheet_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Reply_Sheet_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_reply_sheet_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_reply_sheet_placeholder(inputs)
	return en_ticket_reply_sheet_placeholder(inputs)
});