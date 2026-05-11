/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_GeneratedInputs */

const en_onboarding_invite_generated = /** @type {(inputs: Onboarding_Invite_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite link generated.`)
};

const es_onboarding_invite_generated = /** @type {(inputs: Onboarding_Invite_GeneratedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace de invitacion generado.`)
};

/**
* | output |
* | --- |
* | "Invite link generated." |
*
* @param {Onboarding_Invite_GeneratedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_generated = /** @type {((inputs?: Onboarding_Invite_GeneratedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_GeneratedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_generated(inputs)
	return es_onboarding_invite_generated(inputs)
});