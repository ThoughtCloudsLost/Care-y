/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ time: NonNullable<unknown> }} Ticket_Tier_Created_AtInputs */

const en_ticket_tier_created_at = /** @type {(inputs: Ticket_Tier_Created_AtInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Created ${i?.time}`)
};

const es_ticket_tier_created_at = /** @type {(inputs: Ticket_Tier_Created_AtInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Creado ${i?.time}`)
};

const en_xa2_ticket_tier_created_at = /** @type {(inputs: Ticket_Tier_Created_AtInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtèd  •••${i?.time}⟧`)
};

/**
* | output |
* | --- |
* | "Created {time}" |
*
* @param {Ticket_Tier_Created_AtInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_created_at = /** @type {((inputs: Ticket_Tier_Created_AtInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Created_AtInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_created_at(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_created_at(inputs)
	return en_ticket_tier_created_at(inputs)
});