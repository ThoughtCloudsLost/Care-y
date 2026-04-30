/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Placeholder_Heading_InvitesInputs */

const en_onboarding_placeholder_heading_invites = /** @type {(inputs: Onboarding_Placeholder_Heading_InvitesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invite Volunteers`)
};

const es_onboarding_placeholder_heading_invites = /** @type {(inputs: Onboarding_Placeholder_Heading_InvitesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Invitar voluntarios`)
};

/**
* | output |
* | --- |
* | "Invite Volunteers" |
*
* @param {Onboarding_Placeholder_Heading_InvitesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_placeholder_heading_invites = /** @type {((inputs?: Onboarding_Placeholder_Heading_InvitesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Placeholder_Heading_InvitesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_placeholder_heading_invites(inputs)
	return es_onboarding_placeholder_heading_invites(inputs)
});