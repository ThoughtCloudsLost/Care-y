/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Communications_SubmitInputs */

const en_onboarding_communications_submit = /** @type {(inputs: Onboarding_Communications_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue`)
};

const es_onboarding_communications_submit = /** @type {(inputs: Onboarding_Communications_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar`)
};

const en_xa2_onboarding_communications_submit = /** @type {(inputs: Onboarding_Communications_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùè •••⟧`)
};

/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Communications_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_communications_submit = /** @type {((inputs?: Onboarding_Communications_SubmitInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Communications_SubmitInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_communications_submit(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_communications_submit(inputs)
	return en_onboarding_communications_submit(inputs)
});