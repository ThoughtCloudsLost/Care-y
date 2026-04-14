/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ category: NonNullable<unknown> }} Library_Back_To_CategoryInputs */

const en_library_back_to_category = /** @type {(inputs: Library_Back_To_CategoryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Back to ${i?.category}`)
};

const es_library_back_to_category = /** @type {(inputs: Library_Back_To_CategoryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Volver a ${i?.category}`)
};

/**
* | output |
* | --- |
* | "Back to {category}" |
*
* @param {Library_Back_To_CategoryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_back_to_category = /** @type {((inputs: Library_Back_To_CategoryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Back_To_CategoryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_back_to_category(inputs)
	return es_library_back_to_category(inputs)
});