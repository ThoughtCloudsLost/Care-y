/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Categories_HeadingInputs */

const en_library_categories_heading = /** @type {(inputs: Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categories`)
};

const es_library_categories_heading = /** @type {(inputs: Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categorías`)
};

/**
* | output |
* | --- |
* | "Categories" |
*
* @param {Library_Categories_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_categories_heading = /** @type {((inputs?: Library_Categories_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Categories_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_categories_heading(inputs)
	return es_library_categories_heading(inputs)
});