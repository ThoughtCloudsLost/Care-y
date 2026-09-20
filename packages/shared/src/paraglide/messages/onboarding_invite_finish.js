/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_FinishInputs */

const en_onboarding_invite_finish = /** @type {(inputs: Onboarding_Invite_FinishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continue`)
};

const es_onboarding_invite_finish = /** @type {(inputs: Onboarding_Invite_FinishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Continuar`)
};

const en_xa2_onboarding_invite_finish = /** @type {(inputs: Onboarding_Invite_FinishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntìnùè •••⟧`)
};

/**
* | output |
* | --- |
* | "Continue" |
*
* @param {Onboarding_Invite_FinishInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_finish = /** @type {((inputs?: Onboarding_Invite_FinishInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_FinishInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_invite_finish(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_invite_finish(inputs)
	return en_onboarding_invite_finish(inputs)
});