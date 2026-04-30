/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_LoadingInputs */

const en_onboarding_setup_loading = /** @type {(inputs: Onboarding_Setup_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Checking setup status...`)
};

const es_onboarding_setup_loading = /** @type {(inputs: Onboarding_Setup_LoadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Verificando estado de configuracion...`)
};

/**
* | output |
* | --- |
* | "Checking setup status..." |
*
* @param {Onboarding_Setup_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_loading = /** @type {((inputs?: Onboarding_Setup_LoadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_LoadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_loading(inputs)
	return es_onboarding_setup_loading(inputs)
});