/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Twofa_ContinueInputs */

const en_onboarding_twofa_continue = /** @type {(inputs: Onboarding_Twofa_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue`)
};

const es_onboarding_twofa_continue = /** @type {(inputs: Onboarding_Twofa_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar`)
};

const en_xa2_onboarding_twofa_continue = /** @type {(inputs: Onboarding_Twofa_ContinueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùè •••⟧`)
};

/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Twofa_ContinueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_twofa_continue = /** @type {((inputs?: Onboarding_Twofa_ContinueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Twofa_ContinueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_twofa_continue(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_twofa_continue(inputs)
	return en_onboarding_twofa_continue(inputs)
});