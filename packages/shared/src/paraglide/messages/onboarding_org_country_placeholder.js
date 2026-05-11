/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Country_PlaceholderInputs */

const en_onboarding_org_country_placeholder = /** @type {(inputs: Onboarding_Org_Country_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a country`)
};

const es_onboarding_org_country_placeholder = /** @type {(inputs: Onboarding_Org_Country_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccione un pais`)
};

/**
* | output |
* | --- |
* | "Select a country" |
*
* @param {Onboarding_Org_Country_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_country_placeholder = /** @type {((inputs?: Onboarding_Org_Country_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Country_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_country_placeholder(inputs)
	return es_onboarding_org_country_placeholder(inputs)
});