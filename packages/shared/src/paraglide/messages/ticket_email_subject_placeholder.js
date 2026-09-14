/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Subject_PlaceholderInputs */

const en_ticket_email_subject_placeholder = /** @type {(inputs: Ticket_Email_Subject_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subject`)
};

const es_ticket_email_subject_placeholder = /** @type {(inputs: Ticket_Email_Subject_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Asunto`)
};

/**
* | output |
* | --- |
* | "Subject" |
*
* @param {Ticket_Email_Subject_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_subject_placeholder = /** @type {((inputs?: Ticket_Email_Subject_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Subject_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_subject_placeholder(inputs)
	return en_ticket_email_subject_placeholder(inputs)
});