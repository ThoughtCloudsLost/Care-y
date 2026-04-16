/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Empty_DescriptionInputs */

const en_library_empty_description = /** @type {(inputs: Library_Empty_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No description`)
};

const es_library_empty_description = /** @type {(inputs: Library_Empty_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin descripción`)
};

/**
* | output |
* | --- |
* | "No description" |
*
* @param {Library_Empty_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_empty_description = /** @type {((inputs?: Library_Empty_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_empty_description(inputs)
	return es_library_empty_description(inputs)
});