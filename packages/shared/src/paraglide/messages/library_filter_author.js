/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Filter_AuthorInputs */

const en_library_filter_author = /** @type {(inputs: Library_Filter_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Author`)
};

const es_library_filter_author = /** @type {(inputs: Library_Filter_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autor`)
};

/**
* | output |
* | --- |
* | "Author" |
*
* @param {Library_Filter_AuthorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_filter_author = /** @type {((inputs?: Library_Filter_AuthorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_AuthorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_filter_author(inputs)
	return es_library_filter_author(inputs)
});