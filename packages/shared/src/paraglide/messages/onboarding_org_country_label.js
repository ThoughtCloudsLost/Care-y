/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Country_LabelInputs */

const en_onboarding_org_country_label = /** @type {(inputs: Onboarding_Org_Country_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Country Code`)
};

const es_onboarding_org_country_label = /** @type {(inputs: Onboarding_Org_Country_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Código de país`)
};

const en_xa2_onboarding_org_country_label = /** @type {(inputs: Onboarding_Org_Country_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còùntry Còdè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Country Code" |
*
* @param {Onboarding_Org_Country_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_country_label = /** @type {((inputs?: Onboarding_Org_Country_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Country_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_country_label(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_country_label(inputs)
	return en_onboarding_org_country_label(inputs)
});