/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Error_No_KeyInputs */

const en_onboarding_escrow_error_no_key = /** @type {(inputs: Onboarding_Escrow_Error_No_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Org encryption key is not loaded. Please restart the setup.`)
};

const es_onboarding_escrow_error_no_key = /** @type {(inputs: Onboarding_Escrow_Error_No_KeyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La clave de cifrado de la organizacion no esta cargada. Reinicie la configuracion.`)
};

/**
* | output |
* | --- |
* | "Org encryption key is not loaded. Please restart the setup." |
*
* @param {Onboarding_Escrow_Error_No_KeyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_error_no_key = /** @type {((inputs?: Onboarding_Escrow_Error_No_KeyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Error_No_KeyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_error_no_key(inputs)
	return es_onboarding_escrow_error_no_key(inputs)
});