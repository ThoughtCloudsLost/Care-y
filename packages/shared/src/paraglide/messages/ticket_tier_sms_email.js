/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Sms_EmailInputs */

const en_ticket_tier_sms_email = /** @type {(inputs: Ticket_Tier_Sms_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS / Email`)
};

const es_ticket_tier_sms_email = /** @type {(inputs: Ticket_Tier_Sms_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS / Correo`)
};

/**
* | output |
* | --- |
* | "SMS / Email" |
*
* @param {Ticket_Tier_Sms_EmailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_sms_email = /** @type {((inputs?: Ticket_Tier_Sms_EmailInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Sms_EmailInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_sms_email(inputs)
	return es_ticket_tier_sms_email(inputs)
});