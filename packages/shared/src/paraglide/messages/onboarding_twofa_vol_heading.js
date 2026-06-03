/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_Vol_HeadingInputs */

const en_onboarding_twofa_vol_heading = /** @type {(inputs: Onboarding_Twofa_Vol_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protect Your Account`)
};

const es_onboarding_twofa_vol_heading = /** @type {(inputs: Onboarding_Twofa_Vol_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protege tu cuenta`)
};

/**
* | output |
* | --- |
* | "Protect Your Account" |
*
* @param {Onboarding_Twofa_Vol_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_vol_heading = /** @type {((inputs?: Onboarding_Twofa_Vol_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_Vol_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_twofa_vol_heading(inputs)
	return es_onboarding_twofa_vol_heading(inputs)
});