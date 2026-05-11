/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ index: NonNullable<unknown> }} Onboarding_Invite_Card_LabelInputs */

const en_onboarding_invite_card_label = /** @type {(inputs: Onboarding_Invite_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invite ${i?.index}`)
};

const es_onboarding_invite_card_label = /** @type {(inputs: Onboarding_Invite_Card_LabelInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Invitacion ${i?.index}`)
};

/**
* | output |
* | --- |
* | "Invite {index}" |
*
* @param {Onboarding_Invite_Card_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_card_label = /** @type {((inputs: Onboarding_Invite_Card_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_Card_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_card_label(inputs)
	return es_onboarding_invite_card_label(inputs)
});