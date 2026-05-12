/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Term_Managers_LabelInputs */

const en_onboarding_org_term_managers_label = /** @type {(inputs: Onboarding_Org_Term_Managers_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Senior roles (plural)`)
};

const es_onboarding_org_term_managers_label = /** @type {(inputs: Onboarding_Org_Term_Managers_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Roles superiores (plural)`)
};

/**
* | output |
* | --- |
* | "Senior roles (plural)" |
*
* @param {Onboarding_Org_Term_Managers_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_term_managers_label = /** @type {((inputs?: Onboarding_Org_Term_Managers_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Term_Managers_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_term_managers_label(inputs)
	return es_onboarding_org_term_managers_label(inputs)
});