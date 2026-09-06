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

/**
* | output |
* | --- |
* | "Email caution" |
*
* @param {Ticket_Email_Inbound_Caution_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_email_inbound_caution_label = /** @type {((inputs?: Ticket_Email_Inbound_Caution_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Email_Inbound_Caution_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_email_inbound_caution_label(inputs)
	return es_ticket_email_inbound_caution_label(inputs)
});