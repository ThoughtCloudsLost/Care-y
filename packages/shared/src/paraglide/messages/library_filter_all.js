/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_AllInputs */

const en_library_filter_all = /** @type {(inputs: Library_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All`)
};

const es_library_filter_all = /** @type {(inputs: Library_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todos`)
};

const en_xa2_library_filter_all = /** @type {(inputs: Library_Filter_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll •⟧`)
};

/**
* | output |
* | --- |
* | "All" |
*
* @param {Library_Filter_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_all = /** @type {((inputs?: Library_Filter_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_all(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_all(inputs)
	return en_library_filter_all(inputs)
});