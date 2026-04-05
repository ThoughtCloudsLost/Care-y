/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_EmptyInputs */

const en_saved_filter_empty = /** @type {(inputs: Saved_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No saved filters`)
};

const es_saved_filter_empty = /** @type {(inputs: Saved_Filter_EmptyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin filtros guardados`)
};

/**
* | output |
* | --- |
* | "No saved filters" |
*
* @param {Saved_Filter_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const saved_filter_empty = /** @type {((inputs?: Saved_Filter_EmptyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_EmptyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_saved_filter_empty(inputs)
	return es_saved_filter_empty(inputs)
});