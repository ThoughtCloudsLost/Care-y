/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_SubtextInputs */

const en_onboarding_invite_subtext = /** @type {(inputs: Onboarding_Invite_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share invite links with your team. Each link is single-use and expires in 72 hours.`)
};

const es_onboarding_invite_subtext = /** @type {(inputs: Onboarding_Invite_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comparta enlaces de invitacion con su equipo. Cada enlace es de un solo uso y expira en 72 horas.`)
};

/**
* | output |
* | --- |
* | "Share invite links with your team. Each link is single-use and expires in 72 hours." |
*
* @param {Onboarding_Invite_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_subtext = /** @type {((inputs?: Onboarding_Invite_SubtextInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_SubtextInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_subtext(inputs)
	return es_onboarding_invite_subtext(inputs)
});