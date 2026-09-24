/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_RequiredInputs */

const en_library_category_required = /** @type {(inputs: Library_Category_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category is required`)
};

const es_library_category_required = /** @type {(inputs: Library_Category_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La categoría es obligatoria`)
};

const en_xa2_library_category_required = /** @type {(inputs: Library_Category_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòry ìs rèqùìrèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Category is required" |
*
* @param {Library_Category_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_required = /** @type {((inputs?: Library_Category_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_required(inputs)
	if (locale === "en-XA") return en_xa2_library_category_required(inputs)
	return en_library_category_required(inputs)
});