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

/**
* | output |
* | --- |
* | "No phone numbers configured for this organization." |
*
* @param {Error_No_Phone_Numbers_ConfiguredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_phone_numbers_configured = /** @type {((inputs?: Error_No_Phone_Numbers_ConfiguredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Phone_Numbers_ConfiguredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_no_phone_numbers_configured(inputs)
	return es_error_no_phone_numbers_configured(inputs)
});