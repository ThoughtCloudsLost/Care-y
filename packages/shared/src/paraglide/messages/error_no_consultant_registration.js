/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Consultant_RegistrationInputs */

const en_error_no_consultant_registration = /** @type {(inputs: Error_No_Consultant_RegistrationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No consultant registration found.`)
};

const es_error_no_consultant_registration = /** @type {(inputs: Error_No_Consultant_RegistrationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se encontró registro de consultor.`)
};

const en_xa2_error_no_consultant_registration = /** @type {(inputs: Error_No_Consultant_RegistrationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò cònsùltànt règìstràtìòn fòùnd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No consultant registration found." |
*
* @param {Error_No_Consultant_RegistrationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_consultant_registration = /** @type {((inputs?: Error_No_Consultant_RegistrationInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Consultant_RegistrationInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_consultant_registration(inputs)
	if (locale === "en-XA") return en_xa2_error_no_consultant_registration(inputs)
	return en_error_no_consultant_registration(inputs)
});