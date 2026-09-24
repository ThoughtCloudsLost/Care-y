/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_DescriptionInputs */

const en_library_category_description = /** @type {(inputs: Library_Category_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Description`)
};

const es_library_category_description = /** @type {(inputs: Library_Category_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descripción`)
};

const en_xa2_library_category_description = /** @type {(inputs: Library_Category_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèscrìptìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Description" |
*
* @param {Library_Category_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_description = /** @type {((inputs?: Library_Category_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_description(inputs)
	if (locale === "en-XA") return en_xa2_library_category_description(inputs)
	return en_library_category_description(inputs)
});