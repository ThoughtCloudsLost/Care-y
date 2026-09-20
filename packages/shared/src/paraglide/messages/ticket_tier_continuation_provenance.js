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

const en_xa2_ticket_tier_continuation_provenance = /** @type {(inputs: Ticket_Tier_Continuation_ProvenanceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtèd by thè càllèr àt ìntàkè ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Created by the caller at intake" |
*
* @param {Ticket_Tier_Continuation_ProvenanceInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_tier_continuation_provenance = /** @type {((inputs?: Ticket_Tier_Continuation_ProvenanceInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Tier_Continuation_ProvenanceInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_tier_continuation_provenance(inputs)
	if (locale === "en-XA") return en_xa2_ticket_tier_continuation_provenance(inputs)
	return en_ticket_tier_continuation_provenance(inputs)
});