/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Category_SaveInputs */

const en_library_category_save = /** @type {(inputs: Library_Category_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save`)
};

const es_library_category_save = /** @type {(inputs: Library_Category_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar`)
};

const en_xa2_library_category_save = /** @type {(inputs: Library_Category_SaveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sàvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Save" |
*
* @param {Library_Category_SaveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_category_save = /** @type {((inputs?: Library_Category_SaveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Category_SaveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_category_save(inputs)
	if (locale === "en-XA") return en_xa2_library_category_save(inputs)
	return en_library_category_save(inputs)
});