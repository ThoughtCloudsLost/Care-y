/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Link_UrlInputs */

const en_library_editor_link_url = /** @type {(inputs: Library_Editor_Link_UrlInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`URL`)
};

const es_library_editor_link_url = /** @type {(inputs: Library_Editor_Link_UrlInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`URL`)
};

/**
* | output |
* | --- |
* | "URL" |
*
* @param {Library_Editor_Link_UrlInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_url = /** @type {((inputs?: Library_Editor_Link_UrlInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_UrlInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_link_url(inputs)
	return es_library_editor_link_url(inputs)
});