/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Sms_Response_Not_FoundInputs */

const en_error_sms_response_not_found = /** @type {(inputs: Error_Sms_Response_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS response not found.`)
};

const es_error_sms_response_not_found = /** @type {(inputs: Error_Sms_Response_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Respuesta SMS no encontrada.`)
};

/**
* | output |
* | --- |
* | "SMS response not found." |
*
* @param {Error_Sms_Response_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sms_response_not_found = /** @type {((inputs?: Error_Sms_Response_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sms_Response_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_sms_response_not_found(inputs)
	return es_error_sms_response_not_found(inputs)
});