/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} New_Pill_Count_At_LeastInputs */

const en_new_pill_count_at_least = /** @type {(inputs: New_Pill_Count_At_LeastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}+ new`)
};

const es_new_pill_count_at_least = /** @type {(inputs: New_Pill_Count_At_LeastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}+ nuevos`)
};

const en_xa2_new_pill_count_at_least = /** @type {(inputs: New_Pill_Count_At_LeastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}+ nèw ••⟧`)
};

/**
* | output |
* | --- |
* | "{count}+ new" |
*
* @param {New_Pill_Count_At_LeastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const new_pill_count_at_least = /** @type {((inputs: New_Pill_Count_At_LeastInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<New_Pill_Count_At_LeastInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_new_pill_count_at_least(inputs)
	if (locale === "en-XA") return en_xa2_new_pill_count_at_least(inputs)
	return en_new_pill_count_at_least(inputs)
});