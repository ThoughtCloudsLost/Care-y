/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteers: NonNullable<unknown> }} Onboarding_Invite_SkipInputs */

const en_onboarding_invite_skip = /** @type {(inputs: Onboarding_Invite_SkipInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`I'll invite ${i?.volunteers} later`)
};

const es_onboarding_invite_skip = /** @type {(inputs: Onboarding_Invite_SkipInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invitare ${i?.volunteers} despues`)
};

/**
* | output |
* | --- |
* | "I'll invite {volunteers} later" |
*
* @param {Onboarding_Invite_SkipInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_skip = /** @type {((inputs: Onboarding_Invite_SkipInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_SkipInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_skip(inputs)
	return es_onboarding_invite_skip(inputs)
});