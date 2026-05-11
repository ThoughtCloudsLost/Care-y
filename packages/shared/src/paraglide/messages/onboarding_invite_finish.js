/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Invite_FinishInputs */

const en_onboarding_invite_finish = /** @type {(inputs: Onboarding_Invite_FinishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Finish Setup`)
};

const es_onboarding_invite_finish = /** @type {(inputs: Onboarding_Invite_FinishInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Finalizar configuracion`)
};

/**
* | output |
* | --- |
* | "Finish Setup" |
*
* @param {Onboarding_Invite_FinishInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_finish = /** @type {((inputs?: Onboarding_Invite_FinishInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Invite_FinishInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_invite_finish(inputs)
	return es_onboarding_invite_finish(inputs)
});