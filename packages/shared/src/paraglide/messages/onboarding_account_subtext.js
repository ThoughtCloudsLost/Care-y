/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_SubtextInputs */

const en_onboarding_account_subtext = /** @type {(inputs: Onboarding_Account_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You'll be the first administrator of this organization.`)
};

const es_onboarding_account_subtext = /** @type {(inputs: Onboarding_Account_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Serás el primer administrador de esta organización.`)
};

const en_xa2_onboarding_account_subtext = /** @type {(inputs: Onboarding_Account_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòù'll bè thè fìrst àdmìnìstràtòr òf thìs òrgànìzàtìòn. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "You'll be the first administrator of this organization." |
*
* @param {Onboarding_Account_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_subtext = /** @type {((inputs?: Onboarding_Account_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_account_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_account_subtext(inputs)
	return en_onboarding_account_subtext(inputs)
});