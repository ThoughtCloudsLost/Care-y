/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_OrgInputs */

const en_onboarding_step_org = /** @type {(inputs: Onboarding_Step_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_onboarding_step_org = /** @type {(inputs: Onboarding_Step_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organización`)
};

const en_xa2_onboarding_step_org = /** @type {(inputs: Onboarding_Step_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn ••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Onboarding_Step_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_org = /** @type {((inputs?: Onboarding_Step_OrgInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_OrgInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_step_org(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_step_org(inputs)
	return en_onboarding_step_org(inputs)
});