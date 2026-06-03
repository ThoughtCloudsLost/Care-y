/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Display_Name_PlaceholderInputs */

const en_onboarding_account_display_name_placeholder = /** @type {(inputs: Onboarding_Account_Display_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How others will see you`)
};

const es_onboarding_account_display_name_placeholder = /** @type {(inputs: Onboarding_Account_Display_Name_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como te veran los demas`)
};

/**
* | output |
* | --- |
* | "How others will see you" |
*
* @param {Onboarding_Account_Display_Name_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_display_name_placeholder = /** @type {((inputs?: Onboarding_Account_Display_Name_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Display_Name_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_display_name_placeholder(inputs)
	return es_onboarding_account_display_name_placeholder(inputs)
});