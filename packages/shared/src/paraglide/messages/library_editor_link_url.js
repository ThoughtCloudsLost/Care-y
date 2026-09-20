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

const en_xa2_library_editor_link_url = /** @type {(inputs: Library_Editor_Link_UrlInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ÙRL •⟧`)
};

/**
* | output |
* | --- |
* | "URL" |
*
* @param {Library_Editor_Link_UrlInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_link_url = /** @type {((inputs?: Library_Editor_Link_UrlInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Link_UrlInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_link_url(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_link_url(inputs)
	return en_library_editor_link_url(inputs)
});