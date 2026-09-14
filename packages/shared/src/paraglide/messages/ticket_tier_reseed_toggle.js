/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Reseed_ToggleInputs */

const en_ticket_tier_reseed_toggle = /** @type {(inputs: Ticket_Tier_Reseed_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recover message history for this client`)
};

const es_ticket_tier_reseed_toggle = /** @type {(inputs: Ticket_Tier_Reseed_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recuperar historial de mensajes para este cliente`)
};

/**
* | output |
* | --- |
* | "Recover message history for this client" |
*
* @param {Ticket_Tier_Reseed_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_reseed_toggle = /** @type {((inputs?: Ticket_Tier_Reseed_ToggleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Reseed_ToggleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_reseed_toggle(inputs)
	return en_ticket_tier_reseed_toggle(inputs)
});