/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Encrypted_BodyInputs */

const en_library_encrypted_body = /** @type {(inputs: Library_Encrypted_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This content could not be decrypted.`)
};

const es_library_encrypted_body = /** @type {(inputs: Library_Encrypted_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo descifrar este contenido.`)
};

/**
* | output |
* | --- |
* | "This content could not be decrypted." |
*
* @param {Library_Encrypted_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_encrypted_body = /** @type {((inputs?: Library_Encrypted_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Encrypted_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_encrypted_body(inputs)
	return es_library_encrypted_body(inputs)
});