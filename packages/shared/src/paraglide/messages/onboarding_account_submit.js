/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_SubmitInputs */

const en_onboarding_account_submit = /** @type {(inputs: Onboarding_Account_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create Account`)
};

const es_onboarding_account_submit = /** @type {(inputs: Onboarding_Account_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear cuenta`)
};

const en_xa2_onboarding_account_submit = /** @type {(inputs: Onboarding_Account_SubmitInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè Àccòùnt •••••⟧`)
};

/**
* | output |
* | --- |
* | "Create Account" |
*
* @param {Onboarding_Account_SubmitInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_submit = /** @type {((inputs?: Onboarding_Account_SubmitInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_SubmitInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_account_submit(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_account_submit(inputs)
	return en_onboarding_account_submit(inputs)
});