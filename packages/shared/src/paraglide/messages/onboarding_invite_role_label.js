/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_Role_LabelInputs */

const en_onboarding_invite_role_label = /** @type {(inputs: Onboarding_Invite_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role`)
};

const es_onboarding_invite_role_label = /** @type {(inputs: Onboarding_Invite_Role_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Rol`)
};

/**
* | output |
* | --- |
* | "Role" |
*
* @param {Onboarding_Invite_Role_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_role_label = /** @type {((inputs?: Onboarding_Invite_Role_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_Role_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_role_label(inputs)
	return es_onboarding_invite_role_label(inputs)
});