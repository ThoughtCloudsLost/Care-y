/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Error_ProviderInputs */

const en_consultant_phone_error_provider = /** @type {(inputs: Consultant_Phone_Error_ProviderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not send the code. Try again later.`)
};

const es_consultant_phone_error_provider = /** @type {(inputs: Consultant_Phone_Error_ProviderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo enviar el codigo. Intenta mas tarde.`)
};

/**
* | output |
* | --- |
* | "Could not send the code. Try again later." |
*
* @param {Consultant_Phone_Error_ProviderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_error_provider = /** @type {((inputs?: Consultant_Phone_Error_ProviderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Error_ProviderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_error_provider(inputs)
	return es_consultant_phone_error_provider(inputs)
});