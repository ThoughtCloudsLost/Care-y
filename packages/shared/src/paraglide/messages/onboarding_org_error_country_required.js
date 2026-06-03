/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Error_Country_RequiredInputs */

const en_onboarding_org_error_country_required = /** @type {(inputs: Onboarding_Org_Error_Country_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a country code.`)
};

const es_onboarding_org_error_country_required = /** @type {(inputs: Onboarding_Org_Error_Country_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccione un codigo de pais.`)
};

/**
* | output |
* | --- |
* | "Select a country code." |
*
* @param {Onboarding_Org_Error_Country_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_error_country_required = /** @type {((inputs?: Onboarding_Org_Error_Country_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Error_Country_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_error_country_required(inputs)
	return es_onboarding_org_error_country_required(inputs)
});