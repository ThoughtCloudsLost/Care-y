/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_SubmittingInputs */

const en_intake_submitting = /** @type {(inputs: Intake_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sending...`)
};

const es_intake_submitting = /** @type {(inputs: Intake_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviando...`)
};

const en_xa2_intake_submitting = /** @type {(inputs: Intake_SubmittingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèndìng... •••⟧`)
};

/**
* | output |
* | --- |
* | "Sending..." |
*
* @param {Intake_SubmittingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_submitting = /** @type {((inputs?: Intake_SubmittingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_SubmittingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_submitting(inputs)
	if (locale === "en-XA") return en_xa2_intake_submitting(inputs)
	return en_intake_submitting(inputs)
});