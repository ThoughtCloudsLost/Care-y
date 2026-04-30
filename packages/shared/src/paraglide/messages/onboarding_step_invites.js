/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Step_InvitesInputs */

const en_onboarding_step_invites = /** @type {(inputs: Onboarding_Step_InvitesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invites`)
};

const es_onboarding_step_invites = /** @type {(inputs: Onboarding_Step_InvitesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitaciones`)
};

/**
* | output |
* | --- |
* | "Invites" |
*
* @param {Onboarding_Step_InvitesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_invites = /** @type {((inputs?: Onboarding_Step_InvitesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Step_InvitesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_step_invites(inputs)
	return es_onboarding_step_invites(inputs)
});