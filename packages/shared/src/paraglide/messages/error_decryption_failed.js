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

/**
* | output |
* | --- |
* | "Could not unlock this content." |
*
* @param {Error_Decryption_FailedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_decryption_failed = /** @type {((inputs?: Error_Decryption_FailedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Decryption_FailedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_decryption_failed(inputs)
	return es_error_decryption_failed(inputs)
});