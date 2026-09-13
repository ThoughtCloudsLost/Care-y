/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_AccountInputs */

const en_ticket_tier_account = /** @type {(inputs: Ticket_Tier_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encrypted Account`)
};

const es_ticket_tier_account = /** @type {(inputs: Ticket_Tier_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuenta cifrada`)
};

/**
* | output |
* | --- |
* | "Encrypted Account" |
*
* @param {Ticket_Tier_AccountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_account = /** @type {((inputs?: Ticket_Tier_AccountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_AccountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_account(inputs)
	return es_ticket_tier_account(inputs)
});