/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_OrgInputs */

const en_onboarding_step_org = /** @type {(inputs: Onboarding_Step_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization`)
};

const es_onboarding_step_org = /** @type {(inputs: Onboarding_Step_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organizacion`)
};

/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Onboarding_Step_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_org = /** @type {((inputs?: Onboarding_Step_OrgInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_OrgInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_org(inputs)
	return es_onboarding_step_org(inputs)
});