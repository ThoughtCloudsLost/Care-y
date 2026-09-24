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

const en_xa2_library_encrypted_title = /** @type {(inputs: Library_Encrypted_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àrtìclè •••⟧`)
};

/**
* | output |
* | --- |
* | "Article" |
*
* @param {Library_Encrypted_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_encrypted_title = /** @type {((inputs?: Library_Encrypted_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Encrypted_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_encrypted_title(inputs)
	if (locale === "en-XA") return en_xa2_library_encrypted_title(inputs)
	return en_library_encrypted_title(inputs)
});