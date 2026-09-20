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

const en_xa2_ticket_tier_revoke = /** @type {(inputs: Ticket_Tier_RevokeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèvòkè lìnk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Revoke link" |
*
* @param {Ticket_Tier_RevokeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_revoke = /** @type {((inputs?: Ticket_Tier_RevokeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_RevokeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_revoke(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_revoke(inputs)
	return en_ticket_tier_revoke(inputs)
});