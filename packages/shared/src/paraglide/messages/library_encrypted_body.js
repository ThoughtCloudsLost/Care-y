/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Encrypted_BodyInputs */

const en_library_encrypted_body = /** @type {(inputs: Library_Encrypted_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not unlock this content.`)
};

const es_library_encrypted_body = /** @type {(inputs: Library_Encrypted_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo desbloquear este contenido.`)
};

const en_xa2_library_encrypted_body = /** @type {(inputs: Library_Encrypted_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùnlòck thìs còntènt. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not unlock this content." |
*
* @param {Library_Encrypted_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_encrypted_body = /** @type {((inputs?: Library_Encrypted_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Encrypted_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_encrypted_body(inputs)
	if (locale === "en-XA") return en_xa2_library_encrypted_body(inputs)
	return en_library_encrypted_body(inputs)
});