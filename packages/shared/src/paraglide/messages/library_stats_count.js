/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Stats_CountInputs */

const en_library_stats_count = /** @type {(inputs: Library_Stats_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} articles`)
};

const es_library_stats_count = /** @type {(inputs: Library_Stats_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} artículos`)
};

const en_xa2_library_stats_count = /** @type {(inputs: Library_Stats_CountInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} àrtìclès •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} articles" |
*
* @param {Library_Stats_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_stats_count = /** @type {((inputs: Library_Stats_CountInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Stats_CountInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_stats_count(inputs)
	if (locale === "en-XA") return en_xa2_library_stats_count(inputs)
	return en_library_stats_count(inputs)
});