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

const en_xa2_library_filter_author = /** @type {(inputs: Library_Filter_AuthorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àùthòr ••⟧`)
};

/**
* | output |
* | --- |
* | "Author" |
*
* @param {Library_Filter_AuthorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_filter_author = /** @type {((inputs?: Library_Filter_AuthorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Filter_AuthorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_filter_author(inputs)
	if (locale === "en-XA") return en_xa2_library_filter_author(inputs)
	return en_library_filter_author(inputs)
});