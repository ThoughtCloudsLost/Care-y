/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Name_PlaceholderInputs */

const en_onboarding_org_name_placeholder = /** @type {(inputs: Onboarding_Org_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`My Organization`)
};

const es_onboarding_org_name_placeholder = /** @type {(inputs: Onboarding_Org_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mi organizacion`)
};

/**
* | output |
* | --- |
* | "My Organization" |
*
* @param {Onboarding_Org_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_name_placeholder = /** @type {((inputs?: Onboarding_Org_Name_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Name_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_name_placeholder(inputs)
	return es_onboarding_org_name_placeholder(inputs)
});