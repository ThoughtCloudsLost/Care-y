/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ label: NonNullable<unknown>, count: NonNullable<unknown> }} Tickets_Filter_CountInputs */

const en_tickets_filter_count = /** @type {(inputs: Tickets_Filter_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.label} (${i?.count})`)
};

/** @type {(inputs: Tickets_Filter_CountInputs) => LocalizedString} */
const es_tickets_filter_count = en_tickets_filter_count;

/**
* | output |
* | --- |
* | "{label} ({count})" |
*
* @param {Tickets_Filter_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_count = /** @type {((inputs: Tickets_Filter_CountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_CountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_count(inputs)
	return es_tickets_filter_count(inputs)
});