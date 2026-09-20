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

const en_xa2_library_categories_heading = /** @type {(inputs: Library_Categories_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòrìès •••⟧`)
};

/**
* | output |
* | --- |
* | "Categories" |
*
* @param {Library_Categories_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_categories_heading = /** @type {((inputs?: Library_Categories_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Categories_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_categories_heading(inputs)
	if (locale === "en-XA") return en_xa2_library_categories_heading(inputs)
	return en_library_categories_heading(inputs)
});