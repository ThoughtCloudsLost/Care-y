/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Name_LabelInputs */

const en_onboarding_org_name_label = /** @type {(inputs: Onboarding_Org_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization Name`)
};

const es_onboarding_org_name_label = /** @type {(inputs: Onboarding_Org_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre de la organización`)
};

const en_xa2_onboarding_org_name_label = /** @type {(inputs: Onboarding_Org_Name_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn Nàmè ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization Name" |
*
* @param {Onboarding_Org_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_name_label = /** @type {((inputs?: Onboarding_Org_Name_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Name_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_name_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_name_label(inputs)
	return en_onboarding_org_name_label(inputs)
});