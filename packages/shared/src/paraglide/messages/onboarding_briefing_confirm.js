/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_ConfirmInputs */

const en_onboarding_briefing_confirm = /** @type {(inputs: Onboarding_Briefing_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm`)
};

const es_onboarding_briefing_confirm = /** @type {(inputs: Onboarding_Briefing_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar`)
};

const en_xa2_onboarding_briefing_confirm = /** @type {(inputs: Onboarding_Briefing_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìrm •••⟧`)
};

/**
* | output |
* | --- |
* | "Confirm" |
*
* @param {Onboarding_Briefing_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_confirm = /** @type {((inputs?: Onboarding_Briefing_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_confirm(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_confirm(inputs)
	return en_onboarding_briefing_confirm(inputs)
});