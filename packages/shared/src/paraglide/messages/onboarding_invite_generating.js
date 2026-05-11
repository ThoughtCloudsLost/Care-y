/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_GeneratingInputs */

const en_onboarding_invite_generating = /** @type {(inputs: Onboarding_Invite_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generating...`)
};

const es_onboarding_invite_generating = /** @type {(inputs: Onboarding_Invite_GeneratingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Generando...`)
};

/**
* | output |
* | --- |
* | "Generating..." |
*
* @param {Onboarding_Invite_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_generating = /** @type {((inputs?: Onboarding_Invite_GeneratingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_GeneratingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_generating(inputs)
	return es_onboarding_invite_generating(inputs)
});