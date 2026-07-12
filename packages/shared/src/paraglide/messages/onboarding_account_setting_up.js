/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_Setting_UpInputs */

const en_onboarding_account_setting_up = /** @type {(inputs: Onboarding_Account_Setting_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setting up your protection...`)
};

const es_onboarding_account_setting_up = /** @type {(inputs: Onboarding_Account_Setting_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurando tu protección...`)
};

/**
* | output |
* | --- |
* | "Setting up your protection..." |
*
* @param {Onboarding_Account_Setting_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_setting_up = /** @type {((inputs?: Onboarding_Account_Setting_UpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Setting_UpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_setting_up(inputs)
	return es_onboarding_account_setting_up(inputs)
});