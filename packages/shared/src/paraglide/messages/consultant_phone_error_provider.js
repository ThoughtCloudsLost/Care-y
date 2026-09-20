/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Error_ProviderInputs */

const en_consultant_phone_error_provider = /** @type {(inputs: Consultant_Phone_Error_ProviderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not send the code. Try again later.`)
};

const es_consultant_phone_error_provider = /** @type {(inputs: Consultant_Phone_Error_ProviderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo enviar el código. Intenta más tarde.`)
};

const en_xa2_consultant_phone_error_provider = /** @type {(inputs: Consultant_Phone_Error_ProviderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt sènd thè còdè. Try àgàìn làtèr. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not send the code. Try again later." |
*
* @param {Consultant_Phone_Error_ProviderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_error_provider = /** @type {((inputs?: Consultant_Phone_Error_ProviderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Error_ProviderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_error_provider(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_error_provider(inputs)
	return en_consultant_phone_error_provider(inputs)
});