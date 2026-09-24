/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Volunteers: NonNullable<unknown>, volunteers: NonNullable<unknown> }} Onboarding_Invite_HeadingInputs */

const en_onboarding_invite_heading = /** @type {(inputs: Onboarding_Invite_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invite ${i?.Volunteers}`)
};

const es_onboarding_invite_heading = /** @type {(inputs: Onboarding_Invite_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invitar ${i?.volunteers}`)
};

const en_xa2_onboarding_invite_heading = /** @type {(inputs: Onboarding_Invite_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Ìnvìtè  •••${i?.Volunteers}⟧`)
};

/**
* | output |
* | --- |
* | "Invite {Volunteers}" |
*
* @param {Onboarding_Invite_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_heading = /** @type {((inputs: Onboarding_Invite_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_invite_heading(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_invite_heading(inputs)
	return en_onboarding_invite_heading(inputs)
});