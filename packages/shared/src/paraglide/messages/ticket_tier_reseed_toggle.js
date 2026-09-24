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

const en_xa2_ticket_tier_reseed_toggle = /** @type {(inputs: Ticket_Tier_Reseed_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòvèr mèssàgè hìstòry fòr thìs clìènt ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Recover message history for this client" |
*
* @param {Ticket_Tier_Reseed_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_reseed_toggle = /** @type {((inputs?: Ticket_Tier_Reseed_ToggleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Reseed_ToggleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_reseed_toggle(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_reseed_toggle(inputs)
	return en_ticket_tier_reseed_toggle(inputs)
});