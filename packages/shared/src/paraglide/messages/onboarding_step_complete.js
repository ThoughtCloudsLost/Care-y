/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_CompleteInputs */

const en_onboarding_step_complete = /** @type {(inputs: Onboarding_Step_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Step complete.`)
};

const es_onboarding_step_complete = /** @type {(inputs: Onboarding_Step_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Paso completado.`)
};

const en_xa2_onboarding_step_complete = /** @type {(inputs: Onboarding_Step_CompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stèp còmplètè. •••••⟧`)
};

/**
* | output |
* | --- |
* | "Step complete." |
*
* @param {Onboarding_Step_CompleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_complete = /** @type {((inputs?: Onboarding_Step_CompleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_CompleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_complete(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_complete(inputs)
	return en_onboarding_step_complete(inputs)
});