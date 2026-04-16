/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Encrypted_TitleInputs */

const en_library_encrypted_title = /** @type {(inputs: Library_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article`)
};

const es_library_encrypted_title = /** @type {(inputs: Library_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Artículo`)
};

/**
* | output |
* | --- |
* | "Article" |
*
* @param {Library_Encrypted_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_encrypted_title = /** @type {((inputs?: Library_Encrypted_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Encrypted_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_encrypted_title(inputs)
	return es_library_encrypted_title(inputs)
});