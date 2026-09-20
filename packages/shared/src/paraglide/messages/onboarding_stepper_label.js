/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Stepper_LabelInputs */

const en_onboarding_stepper_label = /** @type {(inputs: Onboarding_Stepper_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setup progress`)
};

const es_onboarding_stepper_label = /** @type {(inputs: Onboarding_Stepper_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Progreso de configuración`)
};

const en_xa2_onboarding_stepper_label = /** @type {(inputs: Onboarding_Stepper_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sètùp prògrèss •••••⟧`)
};

/**
* | output |
* | --- |
* | "Setup progress" |
*
* @param {Onboarding_Stepper_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_stepper_label = /** @type {((inputs?: Onboarding_Stepper_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Stepper_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_stepper_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_stepper_label(inputs)
	return en_onboarding_stepper_label(inputs)
});