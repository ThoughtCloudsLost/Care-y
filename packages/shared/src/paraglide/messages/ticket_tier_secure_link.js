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

const en_xa2_ticket_tier_secure_link = /** @type {(inputs: Ticket_Tier_Secure_LinkInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrè Lìnk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Secure Link" |
*
* @param {Ticket_Tier_Secure_LinkInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_secure_link = /** @type {((inputs?: Ticket_Tier_Secure_LinkInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Secure_LinkInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_secure_link(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_secure_link(inputs)
	return en_ticket_tier_secure_link(inputs)
});