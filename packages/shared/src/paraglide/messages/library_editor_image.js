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

const en_xa2_library_editor_image = /** @type {(inputs: Library_Editor_ImageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìmàgè ••⟧`)
};

/**
* | output |
* | --- |
* | "Image" |
*
* @param {Library_Editor_ImageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_editor_image = /** @type {((inputs?: Library_Editor_ImageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Editor_ImageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_editor_image(inputs)
	if (locale === "en-XA") return en_xa2_library_editor_image(inputs)
	return en_library_editor_image(inputs)
});