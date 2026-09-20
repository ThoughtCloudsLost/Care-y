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

const en_xa2_error_sms_response_not_found = /** @type {(inputs: Error_Sms_Response_Not_FoundInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS rèspònsè nòt fòùnd. •••••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS response not found." |
*
* @param {Error_Sms_Response_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_sms_response_not_found = /** @type {((inputs?: Error_Sms_Response_Not_FoundInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sms_Response_Not_FoundInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_sms_response_not_found(inputs)
	if (locale === "en-XA") return en_xa2_error_sms_response_not_found(inputs)
	return en_error_sms_response_not_found(inputs)
});