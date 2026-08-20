/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Account_ResetInputs */

const en_ticket_tier_account_reset = /** @type {(inputs: Ticket_Tier_Account_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset account`)
};

const es_ticket_tier_account_reset = /** @type {(inputs: Ticket_Tier_Account_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer cuenta`)
};

/**
* | output |
* | --- |
* | "Reset account" |
*
* @param {Ticket_Tier_Account_ResetInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_account_reset = /** @type {((inputs?: Ticket_Tier_Account_ResetInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Account_ResetInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_account_reset(inputs)
	return es_ticket_tier_account_reset(inputs)
});