/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_ErrorInputs */

const en_onboarding_setup_error = /** @type {(inputs: Onboarding_Setup_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Could not check setup status. Please try again.`)
};

const es_onboarding_setup_error = /** @type {(inputs: Onboarding_Setup_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo verificar el estado de configuración. Intenta de nuevo.`)
};

const en_xa2_onboarding_setup_error = /** @type {(inputs: Onboarding_Setup_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùld nòt chèck sètùp stàtùs. Plèàsè try àgàìn. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Could not check setup status. Please try again." |
*
* @param {Onboarding_Setup_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_error = /** @type {((inputs?: Onboarding_Setup_ErrorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_ErrorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_setup_error(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_setup_error(inputs)
	return en_onboarding_setup_error(inputs)
});