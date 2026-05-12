/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Onboarding_Account_Display_Name_InfoInputs */

const en_onboarding_account_display_name_info = /** @type {(inputs: Onboarding_Account_Display_Name_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Visible to other ${i?.volunteers} in your organization.`)
};

const es_onboarding_account_display_name_info = /** @type {(inputs: Onboarding_Account_Display_Name_InfoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Visible para otros ${i?.volunteers} en tu organizacion.`)
};

/**
* | output |
* | --- |
* | "Visible to other {volunteers} in your organization." |
*
* @param {Onboarding_Account_Display_Name_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_display_name_info = /** @type {((inputs: Onboarding_Account_Display_Name_InfoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Display_Name_InfoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_display_name_info(inputs)
	return es_onboarding_account_display_name_info(inputs)
});