/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_Url_LabelInputs */

const en_onboarding_invite_url_label = /** @type {(inputs: Onboarding_Invite_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite link:`)
};

const es_onboarding_invite_url_label = /** @type {(inputs: Onboarding_Invite_Url_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace de invitacion:`)
};

/**
* | output |
* | --- |
* | "Invite link:" |
*
* @param {Onboarding_Invite_Url_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_url_label = /** @type {((inputs?: Onboarding_Invite_Url_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_Url_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_url_label(inputs)
	return es_onboarding_invite_url_label(inputs)
});