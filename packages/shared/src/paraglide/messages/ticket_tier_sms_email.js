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

const en_xa2_ticket_tier_sms_email = /** @type {(inputs: Ticket_Tier_Sms_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS / Èmàìl ••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS / Email" |
*
* @param {Ticket_Tier_Sms_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_sms_email = /** @type {((inputs?: Ticket_Tier_Sms_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Sms_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_sms_email(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_sms_email(inputs)
	return en_ticket_tier_sms_email(inputs)
});