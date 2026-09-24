/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Sms_2fa_Not_AvailableInputs */

const en_error_sms_2fa_not_available = /** @type {(inputs: Error_Sms_2fa_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS verification is not available for this organization.`)
};

const es_error_sms_2fa_not_available = /** @type {(inputs: Error_Sms_2fa_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La verificación por SMS no está disponible para esta organización.`)
};

const en_xa2_error_sms_2fa_not_available = /** @type {(inputs: Error_Sms_2fa_Not_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦SMS vèrìfìcàtìòn ìs nòt àvàìlàblè fòr thìs òrgànìzàtìòn. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "SMS verification is not available for this organization." |
*
* @param {Error_Sms_2fa_Not_AvailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_sms_2fa_not_available = /** @type {((inputs?: Error_Sms_2fa_Not_AvailableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Sms_2fa_Not_AvailableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_sms_2fa_not_available(inputs)
	if (locale === "en-XA") return en_xa2_error_sms_2fa_not_available(inputs)
	return en_error_sms_2fa_not_available(inputs)
});