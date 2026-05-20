/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Reauth_HeadingInputs */

const en_onboarding_reauth_heading = /** @type {(inputs: Onboarding_Reauth_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sign Back In`)
};

const es_onboarding_reauth_heading = /** @type {(inputs: Onboarding_Reauth_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volver a iniciar sesion`)
};

/**
* | output |
* | --- |
* | "Sign Back In" |
*
* @param {Onboarding_Reauth_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_reauth_heading = /** @type {((inputs?: Onboarding_Reauth_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Reauth_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_reauth_heading(inputs)
	return es_onboarding_reauth_heading(inputs)
});