/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ subject: NonNullable<unknown> }} Ticket_Email_Subject_LabelInputs */

const en_ticket_email_subject_label = /** @type {(inputs: Ticket_Email_Subject_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Subject: ${i?.subject}`)
};

const es_ticket_email_subject_label = /** @type {(inputs: Ticket_Email_Subject_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Asunto: ${i?.subject}`)
};

/**
* | output |
* | --- |
* | "Subject: {subject}" |
*
* @param {Ticket_Email_Subject_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_subject_label = /** @type {((inputs: Ticket_Email_Subject_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Subject_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_subject_label(inputs)
	return en_ticket_email_subject_label(inputs)
});