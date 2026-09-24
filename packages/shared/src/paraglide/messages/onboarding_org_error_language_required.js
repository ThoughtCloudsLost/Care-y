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

const en_xa2_onboarding_org_error_language_required = /** @type {(inputs: Onboarding_Org_Error_Language_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct à dèfàùlt làngùàgè. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Select a default language." |
*
* @param {Onboarding_Org_Error_Language_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_error_language_required = /** @type {((inputs?: Onboarding_Org_Error_Language_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Error_Language_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_error_language_required(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_error_language_required(inputs)
	return en_onboarding_org_error_language_required(inputs)
});