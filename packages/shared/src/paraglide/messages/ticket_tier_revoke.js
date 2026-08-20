/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_RevokeInputs */

const en_ticket_tier_revoke = /** @type {(inputs: Ticket_Tier_RevokeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revoke link`)
};

const es_ticket_tier_revoke = /** @type {(inputs: Ticket_Tier_RevokeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revocar enlace`)
};

/**
* | output |
* | --- |
* | "Revoke link" |
*
* @param {Ticket_Tier_RevokeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_revoke = /** @type {((inputs?: Ticket_Tier_RevokeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_RevokeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_revoke(inputs)
	return es_ticket_tier_revoke(inputs)
});