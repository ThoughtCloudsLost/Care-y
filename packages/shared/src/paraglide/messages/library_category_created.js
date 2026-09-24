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

const en_xa2_library_category_created = /** @type {(inputs: Library_Category_CreatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càtègòry crèàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Category created" |
*
* @param {Library_Category_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_created = /** @type {((inputs?: Library_Category_CreatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_CreatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_created(inputs)
	if (locale === "en-XA") return en_xa2_library_category_created(inputs)
	return en_library_category_created(inputs)
});