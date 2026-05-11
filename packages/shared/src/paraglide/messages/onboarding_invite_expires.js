/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ expiresAt: NonNullable<unknown> }} Onboarding_Invite_ExpiresInputs */

const en_onboarding_invite_expires = /** @type {(inputs: Onboarding_Invite_ExpiresInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expires ${i?.expiresAt}`)
};

const es_onboarding_invite_expires = /** @type {(inputs: Onboarding_Invite_ExpiresInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Expira ${i?.expiresAt}`)
};

/**
* | output |
* | --- |
* | "Expires {expiresAt}" |
*
* @param {Onboarding_Invite_ExpiresInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_expires = /** @type {((inputs: Onboarding_Invite_ExpiresInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_ExpiresInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_expires(inputs)
	return es_onboarding_invite_expires(inputs)
});