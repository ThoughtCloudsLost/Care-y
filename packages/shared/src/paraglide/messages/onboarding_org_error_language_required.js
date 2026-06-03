/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Error_Language_RequiredInputs */

const en_onboarding_org_error_language_required = /** @type {(inputs: Onboarding_Org_Error_Language_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a default language.`)
};

const es_onboarding_org_error_language_required = /** @type {(inputs: Onboarding_Org_Error_Language_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccione un idioma predeterminado.`)
};

/**
* | output |
* | --- |
* | "Select a default language." |
*
* @param {Onboarding_Org_Error_Language_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_error_language_required = /** @type {((inputs?: Onboarding_Org_Error_Language_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Error_Language_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_org_error_language_required(inputs)
	return es_onboarding_org_error_language_required(inputs)
});