/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Decryption_FailedInputs */

const en_error_decryption_failed = /** @type {(inputs: Error_Decryption_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not unlock this content.`)
};

const es_error_decryption_failed = /** @type {(inputs: Error_Decryption_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo desbloquear este contenido.`)
};

const en_xa2_error_decryption_failed = /** @type {(inputs: Error_Decryption_FailedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt ùnlòck thìs còntènt. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not unlock this content." |
*
* @param {Error_Decryption_FailedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_decryption_failed = /** @type {((inputs?: Error_Decryption_FailedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Decryption_FailedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_decryption_failed(inputs)
	if (locale === "en-XA") return en_xa2_error_decryption_failed(inputs)
	return en_error_decryption_failed(inputs)
});