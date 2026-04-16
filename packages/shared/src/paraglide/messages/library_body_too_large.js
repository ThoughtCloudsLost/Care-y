/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Body_Too_LargeInputs */

const en_library_body_too_large = /** @type {(inputs: Library_Body_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article body is too large. Remove some content or images.`)
};

const es_library_body_too_large = /** @type {(inputs: Library_Body_Too_LargeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El cuerpo del artículo es demasiado grande. Elimina contenido o imágenes.`)
};

/**
* | output |
* | --- |
* | "Article body is too large. Remove some content or images." |
*
* @param {Library_Body_Too_LargeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_body_too_large = /** @type {((inputs?: Library_Body_Too_LargeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Body_Too_LargeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_body_too_large(inputs)
	return es_library_body_too_large(inputs)
});