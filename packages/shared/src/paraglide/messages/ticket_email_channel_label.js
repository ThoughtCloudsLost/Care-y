/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Channel_LabelInputs */

const en_ticket_email_channel_label = /** @type {(inputs: Ticket_Email_Channel_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email`)
};

const es_ticket_email_channel_label = /** @type {(inputs: Ticket_Email_Channel_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Correo`)
};

/**
* | output |
* | --- |
* | "Email" |
*
* @param {Ticket_Email_Channel_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_channel_label = /** @type {((inputs?: Ticket_Email_Channel_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Channel_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_channel_label(inputs)
	return en_ticket_email_channel_label(inputs)
});