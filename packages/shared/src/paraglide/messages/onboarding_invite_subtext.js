/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_SubtextInputs */

const en_onboarding_invite_subtext = /** @type {(inputs: Onboarding_Invite_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Share invite links with your team, or create accounts directly. Each invite link is single-use and expires in 72 hours.`)
};

const es_onboarding_invite_subtext = /** @type {(inputs: Onboarding_Invite_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Comparta enlaces de invitación con su equipo o cree cuentas directamente. Cada enlace de invitación es de un solo uso y expira en 72 horas.`)
};

const en_xa2_onboarding_invite_subtext = /** @type {(inputs: Onboarding_Invite_SubtextInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shàrè ìnvìtè lìnks wìth yòùr tèàm, òr crèàtè àccòùnts dìrèctly. Èàch ìnvìtè lìnk ìs sìnglè-ùsè ànd èxpìrès ìn 72 hòùrs. ••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Share invite links with your team, or create accounts directly. Each invite link is single-use and expires in 72 hours." |
*
* @param {Onboarding_Invite_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_subtext = /** @type {((inputs?: Onboarding_Invite_SubtextInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_SubtextInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_invite_subtext(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_invite_subtext(inputs)
	return en_onboarding_invite_subtext(inputs)
});