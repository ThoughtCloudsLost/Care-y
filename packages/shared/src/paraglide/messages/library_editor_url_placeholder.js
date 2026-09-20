/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_Url_PlaceholderInputs */

const en_library_editor_url_placeholder = /** @type {(inputs: Library_Editor_Url_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://`)
};

const es_library_editor_url_placeholder = /** @type {(inputs: Library_Editor_Url_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`https://`)
};

const en_xa2_library_editor_url_placeholder = /** @type {(inputs: Library_Editor_Url_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦https:// •••⟧`)
};

/**
* | output |
* | --- |
* | "https://" |
*
* @param {Library_Editor_Url_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_url_placeholder = /** @type {((inputs?: Library_Editor_Url_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_Url_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_url_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_url_placeholder(inputs)
	return en_library_editor_url_placeholder(inputs)
});