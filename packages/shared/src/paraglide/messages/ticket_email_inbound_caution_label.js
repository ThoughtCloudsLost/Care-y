/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Email_Inbound_Caution_LabelInputs */

const en_ticket_email_inbound_caution_label = /** @type {(inputs: Ticket_Email_Inbound_Caution_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Email caution`)
};

const es_ticket_email_inbound_caution_label = /** @type {(inputs: Ticket_Email_Inbound_Caution_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aviso sobre correo electrónico`)
};

const en_xa2_ticket_email_inbound_caution_label = /** @type {(inputs: Ticket_Email_Inbound_Caution_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìl càùtìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Email caution" |
*
* @param {Ticket_Email_Inbound_Caution_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_caution_label = /** @type {((inputs?: Ticket_Email_Inbound_Caution_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_Caution_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_email_inbound_caution_label(inputs)
	if (locale === "en-XA") return en_xa2_ticket_email_inbound_caution_label(inputs)
	return en_ticket_email_inbound_caution_label(inputs)
});