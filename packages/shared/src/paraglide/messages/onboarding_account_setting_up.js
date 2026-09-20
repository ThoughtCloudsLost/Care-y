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

const en_xa2_onboarding_account_setting_up = /** @type {(inputs: Onboarding_Account_Setting_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèttìng ùp yòùr pròtèctìòn... •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Setting up your protection..." |
*
* @param {Onboarding_Account_Setting_UpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_setting_up = /** @type {((inputs?: Onboarding_Account_Setting_UpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_Setting_UpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_account_setting_up(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_account_setting_up(inputs)
	return en_onboarding_account_setting_up(inputs)
});