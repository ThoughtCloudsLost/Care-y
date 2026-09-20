/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_HeadingInputs */

const en_onboarding_reauth_heading = /** @type {(inputs: Onboarding_Reauth_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign Back In`)
};

const es_onboarding_reauth_heading = /** @type {(inputs: Onboarding_Reauth_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver a iniciar sesión`)
};

const en_xa2_onboarding_reauth_heading = /** @type {(inputs: Onboarding_Reauth_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìgn Bàck Ìn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Sign Back In" |
*
* @param {Onboarding_Reauth_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_heading = /** @type {((inputs?: Onboarding_Reauth_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_reauth_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_reauth_heading(inputs)
	return en_onboarding_reauth_heading(inputs)
});