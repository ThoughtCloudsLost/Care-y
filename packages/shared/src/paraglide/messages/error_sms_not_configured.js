/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Sms_Not_ConfiguredInputs */

const en_error_sms_not_configured = /** @type {(inputs: Error_Sms_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS is not available. Telephony is not configured.`)
};

const es_error_sms_not_configured = /** @type {(inputs: Error_Sms_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS no está disponible. La telefonía no está configurada.`)
};

/**
* | output |
* | --- |
* | "SMS is not available. Telephony is not configured." |
*
* @param {Error_Sms_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_sms_not_configured = /** @type {((inputs?: Error_Sms_Not_ConfiguredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sms_Not_ConfiguredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_sms_not_configured(inputs)
	return es_error_sms_not_configured(inputs)
});