/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Stepper_LabelInputs */

const en_onboarding_stepper_label = /** @type {(inputs: Onboarding_Stepper_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setup progress`)
};

const es_onboarding_stepper_label = /** @type {(inputs: Onboarding_Stepper_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Progreso de configuracion`)
};

/**
* | output |
* | --- |
* | "Setup progress" |
*
* @param {Onboarding_Stepper_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_stepper_label = /** @type {((inputs?: Onboarding_Stepper_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Stepper_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_stepper_label(inputs)
	return es_onboarding_stepper_label(inputs)
});