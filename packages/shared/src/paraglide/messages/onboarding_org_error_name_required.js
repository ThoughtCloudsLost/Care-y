/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Org_Error_Name_RequiredInputs */

const en_onboarding_org_error_name_required = /** @type {(inputs: Onboarding_Org_Error_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization name is required.`)
};

const es_onboarding_org_error_name_required = /** @type {(inputs: Onboarding_Org_Error_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El nombre de la organización es obligatorio.`)
};

const en_xa2_onboarding_org_error_name_required = /** @type {(inputs: Onboarding_Org_Error_Name_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn nàmè ìs rèqùìrèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization name is required." |
*
* @param {Onboarding_Org_Error_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_error_name_required = /** @type {((inputs?: Onboarding_Org_Error_Name_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Org_Error_Name_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_org_error_name_required(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_org_error_name_required(inputs)
	return en_onboarding_org_error_name_required(inputs)
});