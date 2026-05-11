/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_DerivingInputs */

const en_onboarding_firstlogin_deriving = /** @type {(inputs: Onboarding_Firstlogin_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generating encryption keys...`)
};

const es_onboarding_firstlogin_deriving = /** @type {(inputs: Onboarding_Firstlogin_DerivingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generando claves de cifrado...`)
};

/**
* | output |
* | --- |
* | "Generating encryption keys..." |
*
* @param {Onboarding_Firstlogin_DerivingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_deriving = /** @type {((inputs?: Onboarding_Firstlogin_DerivingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_DerivingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_deriving(inputs)
	return es_onboarding_firstlogin_deriving(inputs)
});