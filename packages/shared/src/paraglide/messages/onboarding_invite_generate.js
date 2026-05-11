/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_GenerateInputs */

const en_onboarding_invite_generate = /** @type {(inputs: Onboarding_Invite_GenerateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate Invite Link`)
};

const es_onboarding_invite_generate = /** @type {(inputs: Onboarding_Invite_GenerateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generar enlace de invitacion`)
};

/**
* | output |
* | --- |
* | "Generate Invite Link" |
*
* @param {Onboarding_Invite_GenerateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_generate = /** @type {((inputs?: Onboarding_Invite_GenerateInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_GenerateInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_generate(inputs)
	return es_onboarding_invite_generate(inputs)
});