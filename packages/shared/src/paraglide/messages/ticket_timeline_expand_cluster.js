/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ summary: NonNullable<unknown> }} Ticket_Timeline_Expand_ClusterInputs */

const en_ticket_timeline_expand_cluster = /** @type {(inputs: Ticket_Timeline_Expand_ClusterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expand ${i?.summary}`)
};

const es_ticket_timeline_expand_cluster = /** @type {(inputs: Ticket_Timeline_Expand_ClusterInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expandir ${i?.summary}`)
};

/**
* | output |
* | --- |
* | "Expand {summary}" |
*
* @param {Ticket_Timeline_Expand_ClusterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_timeline_expand_cluster = /** @type {((inputs: Ticket_Timeline_Expand_ClusterInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Timeline_Expand_ClusterInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_timeline_expand_cluster(inputs)
	return es_ticket_timeline_expand_cluster(inputs)
});