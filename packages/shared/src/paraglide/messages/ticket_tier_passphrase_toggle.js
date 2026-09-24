/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Passphrase_ToggleInputs */

const en_ticket_tier_passphrase_toggle = /** @type {(inputs: Ticket_Tier_Passphrase_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add a passphrase`)
};

const es_ticket_tier_passphrase_toggle = /** @type {(inputs: Ticket_Tier_Passphrase_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar frase de acceso`)
};

const en_xa2_ticket_tier_passphrase_toggle = /** @type {(inputs: Ticket_Tier_Passphrase_ToggleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd à pàssphràsè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Add a passphrase" |
*
* @param {Ticket_Tier_Passphrase_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_passphrase_toggle = /** @type {((inputs?: Ticket_Tier_Passphrase_ToggleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Passphrase_ToggleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_passphrase_toggle(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_passphrase_toggle(inputs)
	return en_ticket_tier_passphrase_toggle(inputs)
});