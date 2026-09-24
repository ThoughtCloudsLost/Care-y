/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Phone_Numbers_ConfiguredInputs */

const en_error_no_phone_numbers_configured = /** @type {(inputs: Error_No_Phone_Numbers_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No phone numbers configured for this organization.`)
};

const es_error_no_phone_numbers_configured = /** @type {(inputs: Error_No_Phone_Numbers_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay números de teléfono configurados para esta organización.`)
};

const en_xa2_error_no_phone_numbers_configured = /** @type {(inputs: Error_No_Phone_Numbers_ConfiguredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò phònè nùmbèrs cònfìgùrèd fòr thìs òrgànìzàtìòn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No phone numbers configured for this organization." |
*
* @param {Error_No_Phone_Numbers_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_phone_numbers_configured = /** @type {((inputs?: Error_No_Phone_Numbers_ConfiguredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Phone_Numbers_ConfiguredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_phone_numbers_configured(inputs)
	if (locale === "en-XA") return en_xa2_error_no_phone_numbers_configured(inputs)
	return en_error_no_phone_numbers_configured(inputs)
});