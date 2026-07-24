/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} New_Pill_Count_OtherInputs */

const en_new_pill_count_other = /** @type {(inputs: New_Pill_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} new`)
};

const es_new_pill_count_other = /** @type {(inputs: New_Pill_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} nuevos`)
};

/**
* | output |
* | --- |
* | "{count} new" |
*
* @param {New_Pill_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const new_pill_count_other = /** @type {((inputs: New_Pill_Count_OtherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<New_Pill_Count_OtherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_new_pill_count_other(inputs)
	return es_new_pill_count_other(inputs)
});