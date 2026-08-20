/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Secure_LinkInputs */

const en_ticket_tier_secure_link = /** @type {(inputs: Ticket_Tier_Secure_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure Link`)
};

const es_ticket_tier_secure_link = /** @type {(inputs: Ticket_Tier_Secure_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro`)
};

/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Ticket_Tier_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link = /** @type {((inputs?: Ticket_Tier_Secure_LinkInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Secure_LinkInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_secure_link(inputs)
	return es_ticket_tier_secure_link(inputs)
});