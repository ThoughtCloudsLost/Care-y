/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_TwofaInputs */

const en_onboarding_step_twofa = /** @type {(inputs: Onboarding_Step_TwofaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Security`)
};

const es_onboarding_step_twofa = /** @type {(inputs: Onboarding_Step_TwofaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seguridad`)
};

const en_xa2_onboarding_step_twofa = /** @type {(inputs: Onboarding_Step_TwofaInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrìty •••⟧`)
};

/**
* | output |
* | --- |
* | "Security" |
*
* @param {Onboarding_Step_TwofaInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_twofa = /** @type {((inputs?: Onboarding_Step_TwofaInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_TwofaInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_twofa(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_twofa(inputs)
	return en_onboarding_step_twofa(inputs)
});