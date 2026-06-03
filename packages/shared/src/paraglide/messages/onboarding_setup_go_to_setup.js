/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Go_To_SetupInputs */

const en_onboarding_setup_go_to_setup = /** @type {(inputs: Onboarding_Setup_Go_To_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go to setup`)
};

const es_onboarding_setup_go_to_setup = /** @type {(inputs: Onboarding_Setup_Go_To_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ir a configuracion`)
};

/**
* | output |
* | --- |
* | "Go to setup" |
*
* @param {Onboarding_Setup_Go_To_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_go_to_setup = /** @type {((inputs?: Onboarding_Setup_Go_To_SetupInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Go_To_SetupInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_go_to_setup(inputs)
	return es_onboarding_setup_go_to_setup(inputs)
});