/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Firstlogin_SubtextInputs */

const en_onboarding_firstlogin_subtext = /** @type {(inputs: Onboarding_Firstlogin_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your admin has invited you.`)
};

const es_onboarding_firstlogin_subtext = /** @type {(inputs: Onboarding_Firstlogin_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu administrador te ha invitado.`)
};

/**
* | output |
* | --- |
* | "Your admin has invited you." |
*
* @param {Onboarding_Firstlogin_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_subtext = /** @type {((inputs?: Onboarding_Firstlogin_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_firstlogin_subtext(inputs)
	return es_onboarding_firstlogin_subtext(inputs)
});