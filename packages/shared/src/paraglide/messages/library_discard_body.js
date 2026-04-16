/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Discard_BodyInputs */

const en_library_discard_body = /** @type {(inputs: Library_Discard_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You have unsaved changes. Discard them?`)
};

const es_library_discard_body = /** @type {(inputs: Library_Discard_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tienes cambios sin guardar. ¿Descartarlos?`)
};

/**
* | output |
* | --- |
* | "You have unsaved changes. Discard them?" |
*
* @param {Library_Discard_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_discard_body = /** @type {((inputs?: Library_Discard_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Discard_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_discard_body(inputs)
	return es_library_discard_body(inputs)
});