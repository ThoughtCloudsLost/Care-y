/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_AnotherInputs */

const en_onboarding_invite_another = /** @type {(inputs: Onboarding_Invite_AnotherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generate Another`)
};

const es_onboarding_invite_another = /** @type {(inputs: Onboarding_Invite_AnotherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generar otro`)
};

/**
* | output |
* | --- |
* | "Generate Another" |
*
* @param {Onboarding_Invite_AnotherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_another = /** @type {((inputs?: Onboarding_Invite_AnotherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_AnotherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_another(inputs)
	return es_onboarding_invite_another(inputs)
});