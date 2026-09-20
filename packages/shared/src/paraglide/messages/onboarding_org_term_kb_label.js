/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Term_Kb_LabelInputs */

const en_onboarding_org_term_kb_label = /** @type {(inputs: Onboarding_Org_Term_Kb_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reference library`)
};

const es_onboarding_org_term_kb_label = /** @type {(inputs: Onboarding_Org_Term_Kb_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Biblioteca de referencia`)
};

const en_xa2_onboarding_org_term_kb_label = /** @type {(inputs: Onboarding_Org_Term_Kb_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèfèrèncè lìbràry ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reference library" |
*
* @param {Onboarding_Org_Term_Kb_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_term_kb_label = /** @type {((inputs?: Onboarding_Org_Term_Kb_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Term_Kb_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_term_kb_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_term_kb_label(inputs)
	return en_onboarding_org_term_kb_label(inputs)
});