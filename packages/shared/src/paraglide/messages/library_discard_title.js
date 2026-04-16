/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Discard_TitleInputs */

const en_library_discard_title = /** @type {(inputs: Library_Discard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Discard changes?`)
};

const es_library_discard_title = /** @type {(inputs: Library_Discard_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Descartar cambios?`)
};

/**
* | output |
* | --- |
* | "Discard changes?" |
*
* @param {Library_Discard_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_discard_title = /** @type {((inputs?: Library_Discard_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Discard_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_discard_title(inputs)
	return es_library_discard_title(inputs)
});