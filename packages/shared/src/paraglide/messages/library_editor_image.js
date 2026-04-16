/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Editor_ImageInputs */

const en_library_editor_image = /** @type {(inputs: Library_Editor_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Image`)
};

const es_library_editor_image = /** @type {(inputs: Library_Editor_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Imagen`)
};

/**
* | output |
* | --- |
* | "Image" |
*
* @param {Library_Editor_ImageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_editor_image = /** @type {((inputs?: Library_Editor_ImageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_ImageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_editor_image(inputs)
	return es_library_editor_image(inputs)
});