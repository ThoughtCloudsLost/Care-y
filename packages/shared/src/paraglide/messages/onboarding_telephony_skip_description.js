/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Telephony_Skip_DescriptionInputs */

const en_onboarding_telephony_skip_description = /** @type {(inputs: Onboarding_Telephony_Skip_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You can set up telephony from the admin panel at any time.`)
};

const es_onboarding_telephony_skip_description = /** @type {(inputs: Onboarding_Telephony_Skip_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Puede configurar la telefonia desde el panel de administracion en cualquier momento.`)
};

/**
* | output |
* | --- |
* | "You can set up telephony from the admin panel at any time." |
*
* @param {Onboarding_Telephony_Skip_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_telephony_skip_description = /** @type {((inputs?: Onboarding_Telephony_Skip_DescriptionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Telephony_Skip_DescriptionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_telephony_skip_description(inputs)
	return es_onboarding_telephony_skip_description(inputs)
});