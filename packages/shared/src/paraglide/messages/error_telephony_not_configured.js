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

const en_xa2_error_telephony_not_configured = /** @type {(inputs: Error_Telephony_Not_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèlèphòny ìs nòt cònfìgùrèd fòr thìs òrgànìzàtìòn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Telephony is not configured for this organization." |
*
* @param {Error_Telephony_Not_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_telephony_not_configured = /** @type {((inputs?: Error_Telephony_Not_ConfiguredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Telephony_Not_ConfiguredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_telephony_not_configured(inputs)
	if (locale === "en-XA") return en_xa2_error_telephony_not_configured(inputs)
	return en_error_telephony_not_configured(inputs)
});