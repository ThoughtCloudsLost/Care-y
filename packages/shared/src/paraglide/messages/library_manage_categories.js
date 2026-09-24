/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Manage_CategoriesInputs */

const en_library_manage_categories = /** @type {(inputs: Library_Manage_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manage categories`)
};

const es_library_manage_categories = /** @type {(inputs: Library_Manage_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrar categorías`)
};

const en_xa2_library_manage_categories = /** @type {(inputs: Library_Manage_CategoriesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mànàgè càtègòrìès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Manage categories" |
*
* @param {Library_Manage_CategoriesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_manage_categories = /** @type {((inputs?: Library_Manage_CategoriesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Manage_CategoriesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_manage_categories(inputs)
	if (locale === "en-XA") return en_xa2_library_manage_categories(inputs)
	return en_library_manage_categories(inputs)
});