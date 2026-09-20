/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ KnowledgeBase: NonNullable<unknown> }} Library_Back_To_LibraryInputs */

const en_library_back_to_library = /** @type {(inputs: Library_Back_To_LibraryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Back to ${i?.KnowledgeBase}`)
};

const es_library_back_to_library = /** @type {(inputs: Library_Back_To_LibraryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Volver a ${i?.KnowledgeBase}`)
};

const en_xa2_library_back_to_library = /** @type {(inputs: Library_Back_To_LibraryInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Bàck tò  •••${i?.KnowledgeBase}⟧`)
};

/**
* | output |
* | --- |
* | "Back to {KnowledgeBase}" |
*
* @param {Library_Back_To_LibraryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_back_to_library = /** @type {((inputs: Library_Back_To_LibraryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Back_To_LibraryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_back_to_library(inputs)
	if (locale === "en-XA") return en_xa2_library_back_to_library(inputs)
	return en_library_back_to_library(inputs)
});