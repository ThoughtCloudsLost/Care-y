/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_LabelInputs */

const en_ticket_tier_label = /** @type {(inputs: Ticket_Tier_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Communication`)
};

const es_ticket_tier_label = /** @type {(inputs: Ticket_Tier_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comunicación`)
};

/**
* | output |
* | --- |
* | "Communication" |
*
* @param {Ticket_Tier_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_label = /** @type {((inputs?: Ticket_Tier_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_label(inputs)
	return es_ticket_tier_label(inputs)
});