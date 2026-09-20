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

const en_xa2_ticket_email_channel_label = /** @type {(inputs: Ticket_Email_Channel_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl ••⟧`)
};

/**
* | output |
* | --- |
* | "Email" |
*
* @param {Ticket_Email_Channel_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_channel_label = /** @type {((inputs?: Ticket_Email_Channel_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Channel_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_channel_label(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_channel_label(inputs)
	return en_ticket_email_channel_label(inputs)
});