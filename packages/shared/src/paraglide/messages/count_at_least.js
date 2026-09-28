/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Count_At_LeastInputs */

const en_count_at_least = /** @type {(inputs: Count_At_LeastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}+`)
};

const es_count_at_least = /** @type {(inputs: Count_At_LeastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count}+`)
};

const en_xa2_count_at_least = /** @type {(inputs: Count_At_LeastInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}+ •⟧`)
};

/**
* | output |
* | --- |
* | "{count}+" |
*
* @param {Count_At_LeastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const count_at_least = /** @type {((inputs: Count_At_LeastInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Count_At_LeastInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_count_at_least(inputs)
	if (locale === "en-XA") return en_xa2_count_at_least(inputs)
	return en_count_at_least(inputs)
});