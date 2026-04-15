/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_CreatedInputs */

const en_library_category_created = /** @type {(inputs: Library_Category_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Category created`)
};

const es_library_category_created = /** @type {(inputs: Library_Category_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categoría creada`)
};

/**
* | output |
* | --- |
* | "Category created" |
*
* @param {Library_Category_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_category_created = /** @type {((inputs?: Library_Category_CreatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_CreatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_category_created(inputs)
	return es_library_category_created(inputs)
});