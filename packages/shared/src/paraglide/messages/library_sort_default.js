/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Sort_DefaultInputs */

const en_library_sort_default = /** @type {(inputs: Library_Sort_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default order`)
};

const es_library_sort_default = /** @type {(inputs: Library_Sort_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Orden predeterminado`)
};

/**
* | output |
* | --- |
* | "Default order" |
*
* @param {Library_Sort_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_sort_default = /** @type {((inputs?: Library_Sort_DefaultInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Sort_DefaultInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_sort_default(inputs)
	return es_library_sort_default(inputs)
});