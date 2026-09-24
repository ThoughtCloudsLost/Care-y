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

const en_xa2_onboarding_telephony_managed_description = /** @type {(inputs: Onboarding_Telephony_Managed_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À mànàgèd sùbàccòùnt wìll bè pròvìsìònèd whèn yòù cònfìgùrè còmmùnìcàtìòns. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A managed subaccount will be provisioned when you configure communications." |
*
* @param {Onboarding_Telephony_Managed_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_managed_description = /** @type {((inputs?: Onboarding_Telephony_Managed_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Managed_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_telephony_managed_description(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_telephony_managed_description(inputs)
	return en_onboarding_telephony_managed_description(inputs)
});