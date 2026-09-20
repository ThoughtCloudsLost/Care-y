/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Wizard_Complete_Next_StepsInputs */

const en_onboarding_wizard_complete_next_steps = /** @type {(inputs: Onboarding_Wizard_Complete_Next_StepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recommended next steps`)
};

const es_onboarding_wizard_complete_next_steps = /** @type {(inputs: Onboarding_Wizard_Complete_Next_StepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proximos pasos recomendados`)
};

const en_xa2_onboarding_wizard_complete_next_steps = /** @type {(inputs: Onboarding_Wizard_Complete_Next_StepsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòmmèndèd nèxt stèps •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Recommended next steps" |
*
* @param {Onboarding_Wizard_Complete_Next_StepsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_next_steps = /** @type {((inputs?: Onboarding_Wizard_Complete_Next_StepsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Wizard_Complete_Next_StepsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_wizard_complete_next_steps(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_wizard_complete_next_steps(inputs)
	return en_onboarding_wizard_complete_next_steps(inputs)
});