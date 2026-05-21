/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Have_TokenInputs */

const en_onboarding_setup_have_token = /** @type {(inputs: Onboarding_Setup_Have_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Have a setup token?`)
};

const es_onboarding_setup_have_token = /** @type {(inputs: Onboarding_Setup_Have_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tienes un token de configuracion?`)
};

/**
* | output |
* | --- |
* | "Have a setup token?" |
*
* @param {Onboarding_Setup_Have_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_have_token = /** @type {((inputs?: Onboarding_Setup_Have_TokenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Have_TokenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_setup_have_token(inputs)
	return es_onboarding_setup_have_token(inputs)
});