/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Account_SubtextInputs */

const en_onboarding_account_subtext = /** @type {(inputs: Onboarding_Account_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You'll be the first administrator of this organization.`)
};

const es_onboarding_account_subtext = /** @type {(inputs: Onboarding_Account_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seras el primer administrador de esta organizacion.`)
};

/**
* | output |
* | --- |
* | "You'll be the first administrator of this organization." |
*
* @param {Onboarding_Account_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_account_subtext = /** @type {((inputs?: Onboarding_Account_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Account_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_account_subtext(inputs)
	return es_onboarding_account_subtext(inputs)
});