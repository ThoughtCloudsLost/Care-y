/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Managed_DescriptionInputs */

const en_onboarding_telephony_managed_description = /** @type {(inputs: Onboarding_Telephony_Managed_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A managed subaccount will be provisioned when you configure communications.`)
};

const es_onboarding_telephony_managed_description = /** @type {(inputs: Onboarding_Telephony_Managed_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se aprovisionara una subcuenta administrada cuando configure las comunicaciones.`)
};

/**
* | output |
* | --- |
* | "A managed subaccount will be provisioned when you configure communications." |
*
* @param {Onboarding_Telephony_Managed_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_description = /** @type {((inputs?: Onboarding_Telephony_Managed_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Managed_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_managed_description(inputs)
	return es_onboarding_telephony_managed_description(inputs)
});