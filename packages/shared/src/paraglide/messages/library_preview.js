/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_PreviewInputs */

const en_library_preview = /** @type {(inputs: Library_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Preview`)
};

const es_library_preview = /** @type {(inputs: Library_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista previa`)
};

const en_xa2_library_preview = /** @type {(inputs: Library_PreviewInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prèvìèw •••⟧`)
};

/**
* | output |
* | --- |
* | "Preview" |
*
* @param {Library_PreviewInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_preview = /** @type {((inputs?: Library_PreviewInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_PreviewInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_preview(inputs)
	if (locale === "en-XA") return en_xa2_library_preview(inputs)
	return en_library_preview(inputs)
});