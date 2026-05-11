/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_ErrorInputs */

const en_onboarding_invite_error = /** @type {(inputs: Onboarding_Invite_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Failed to generate invite link.`)
};

const es_onboarding_invite_error = /** @type {(inputs: Onboarding_Invite_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudo generar el enlace de invitacion.`)
};

/**
* | output |
* | --- |
* | "Failed to generate invite link." |
*
* @param {Onboarding_Invite_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_error = /** @type {((inputs?: Onboarding_Invite_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_error(inputs)
	return es_onboarding_invite_error(inputs)
});