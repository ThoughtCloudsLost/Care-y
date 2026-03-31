/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Telephony_Not_ConfiguredInputs */

const en_error_telephony_not_configured = /** @type {(inputs: Error_Telephony_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telephony is not configured for this organization.`)
};

const es_error_telephony_not_configured = /** @type {(inputs: Error_Telephony_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La telefonía no está configurada para esta organización.`)
};

/**
* | output |
* | --- |
* | "Telephony is not configured for this organization." |
*
* @param {Error_Telephony_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_telephony_not_configured = /** @type {((inputs?: Error_Telephony_Not_ConfiguredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Telephony_Not_ConfiguredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_telephony_not_configured(inputs)
	return es_error_telephony_not_configured(inputs)
});