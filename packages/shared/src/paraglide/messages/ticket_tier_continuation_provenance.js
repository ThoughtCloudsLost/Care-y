/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Tier_Continuation_ProvenanceInputs */

const en_ticket_tier_continuation_provenance = /** @type {(inputs: Ticket_Tier_Continuation_ProvenanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Created by the caller at intake`)
};

const es_ticket_tier_continuation_provenance = /** @type {(inputs: Ticket_Tier_Continuation_ProvenanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Creado por la persona que llamó al momento del ingreso`)
};

/**
* | output |
* | --- |
* | "Created by the caller at intake" |
*
* @param {Ticket_Tier_Continuation_ProvenanceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_continuation_provenance = /** @type {((inputs?: Ticket_Tier_Continuation_ProvenanceInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Continuation_ProvenanceInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_tier_continuation_provenance(inputs)
	return es_ticket_tier_continuation_provenance(inputs)
});