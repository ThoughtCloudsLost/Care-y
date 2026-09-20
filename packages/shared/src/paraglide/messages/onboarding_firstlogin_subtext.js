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

const en_xa2_onboarding_firstlogin_subtext = /** @type {(inputs: Onboarding_Firstlogin_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr àdmìn hàs ìnvìtèd yòù. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your admin has invited you." |
*
* @param {Onboarding_Firstlogin_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_firstlogin_subtext = /** @type {((inputs?: Onboarding_Firstlogin_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Firstlogin_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_firstlogin_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_firstlogin_subtext(inputs)
	return en_onboarding_firstlogin_subtext(inputs)
});