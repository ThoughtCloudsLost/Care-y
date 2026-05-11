/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_CopiedInputs */

const en_onboarding_invite_copied = /** @type {(inputs: Onboarding_Invite_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link copied to clipboard.`)
};

const es_onboarding_invite_copied = /** @type {(inputs: Onboarding_Invite_CopiedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace copiado al portapapeles.`)
};

/**
* | output |
* | --- |
* | "Link copied to clipboard." |
*
* @param {Onboarding_Invite_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_copied = /** @type {((inputs?: Onboarding_Invite_CopiedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_CopiedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_copied(inputs)
	return es_onboarding_invite_copied(inputs)
});