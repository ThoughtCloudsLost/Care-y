/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Setup_Have_TokenInputs */

const en_onboarding_setup_have_token = /** @type {(inputs: Onboarding_Setup_Have_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Have a setup token?`)
};

const es_onboarding_setup_have_token = /** @type {(inputs: Onboarding_Setup_Have_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Tienes un token de configuración?`)
};

const en_xa2_onboarding_setup_have_token = /** @type {(inputs: Onboarding_Setup_Have_TokenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hàvè à sètùp tòkèn? ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Have a setup token?" |
*
* @param {Onboarding_Setup_Have_TokenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_setup_have_token = /** @type {((inputs?: Onboarding_Setup_Have_TokenInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Setup_Have_TokenInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_setup_have_token(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_setup_have_token(inputs)
	return en_onboarding_setup_have_token(inputs)
});