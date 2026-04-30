/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Wizard_Complete_GoInputs */

const en_onboarding_wizard_complete_go = /** @type {(inputs: Onboarding_Wizard_Complete_GoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go to Dashboard`)
};

const es_onboarding_wizard_complete_go = /** @type {(inputs: Onboarding_Wizard_Complete_GoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ir al panel`)
};

/**
* | output |
* | --- |
* | "Go to Dashboard" |
*
* @param {Onboarding_Wizard_Complete_GoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_go = /** @type {((inputs?: Onboarding_Wizard_Complete_GoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Wizard_Complete_GoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_wizard_complete_go(inputs)
	return es_onboarding_wizard_complete_go(inputs)
});