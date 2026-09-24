/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Country_PlaceholderInputs */

const en_onboarding_org_country_placeholder = /** @type {(inputs: Onboarding_Org_Country_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a country`)
};

const es_onboarding_org_country_placeholder = /** @type {(inputs: Onboarding_Org_Country_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccione un país`)
};

const en_xa2_onboarding_org_country_placeholder = /** @type {(inputs: Onboarding_Org_Country_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct à còùntry •••••⟧`)
};

/**
* | output |
* | --- |
* | "Select a country" |
*
* @param {Onboarding_Org_Country_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_country_placeholder = /** @type {((inputs?: Onboarding_Org_Country_PlaceholderInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Country_PlaceholderInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_country_placeholder(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_country_placeholder(inputs)
	return en_onboarding_org_country_placeholder(inputs)
});