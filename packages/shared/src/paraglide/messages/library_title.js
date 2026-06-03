/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ KnowledgeBase: NonNullable<unknown> }} Library_TitleInputs */

const en_library_title = /** @type {(inputs: Library_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

const es_library_title = /** @type {(inputs: Library_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Library_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_title = /** @type {((inputs: Library_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_title(inputs)
	return es_library_title(inputs)
});