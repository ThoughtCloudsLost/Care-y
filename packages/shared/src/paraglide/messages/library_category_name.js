/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_NameInputs */

const en_library_category_name = /** @type {(inputs: Library_Category_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Name`)
};

const es_library_category_name = /** @type {(inputs: Library_Category_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre`)
};

const en_xa2_library_category_name = /** @type {(inputs: Library_Category_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nàmè ••⟧`)
};

/**
* | output |
* | --- |
* | "Name" |
*
* @param {Library_Category_NameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_name = /** @type {((inputs?: Library_Category_NameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_NameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_name(inputs)
	if (locale === "en-XA") return en_xa2_library_category_name(inputs)
	return en_library_category_name(inputs)
});