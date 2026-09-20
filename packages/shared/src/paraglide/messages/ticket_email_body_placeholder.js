/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Body_PlaceholderInputs */

const en_ticket_email_body_placeholder = /** @type {(inputs: Ticket_Email_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Write your message...`)
};

const es_ticket_email_body_placeholder = /** @type {(inputs: Ticket_Email_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Escribe tu mensaje...`)
};

const en_xa2_ticket_email_body_placeholder = /** @type {(inputs: Ticket_Email_Body_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wrìtè yòùr mèssàgè... •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Write your message..." |
*
* @param {Ticket_Email_Body_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_body_placeholder = /** @type {((inputs?: Ticket_Email_Body_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Body_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_body_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_body_placeholder(inputs)
	return en_ticket_email_body_placeholder(inputs)
});