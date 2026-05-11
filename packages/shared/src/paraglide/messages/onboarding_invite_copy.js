/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_CopyInputs */

const en_onboarding_invite_copy = /** @type {(inputs: Onboarding_Invite_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copy`)
};

const es_onboarding_invite_copy = /** @type {(inputs: Onboarding_Invite_CopyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Copiar`)
};

/**
* | output |
* | --- |
* | "Copy" |
*
* @param {Onboarding_Invite_CopyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_copy = /** @type {((inputs?: Onboarding_Invite_CopyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_CopyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_copy(inputs)
	return es_onboarding_invite_copy(inputs)
});