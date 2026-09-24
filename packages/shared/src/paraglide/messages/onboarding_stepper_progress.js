/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ current: NonNullable<unknown>, total: NonNullable<unknown> }} Onboarding_Stepper_ProgressInputs */

const en_onboarding_stepper_progress = /** @type {(inputs: Onboarding_Stepper_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Step ${i?.current} of ${i?.total}`)
};

const es_onboarding_stepper_progress = /** @type {(inputs: Onboarding_Stepper_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Paso ${i?.current} de ${i?.total}`)
};

const en_xa2_onboarding_stepper_progress = /** @type {(inputs: Onboarding_Stepper_ProgressInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Stèp  ••${i?.current} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "Step {current} of {total}" |
*
* @param {Onboarding_Stepper_ProgressInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_stepper_progress = /** @type {((inputs: Onboarding_Stepper_ProgressInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Stepper_ProgressInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_stepper_progress(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_stepper_progress(inputs)
	return en_onboarding_stepper_progress(inputs)
});