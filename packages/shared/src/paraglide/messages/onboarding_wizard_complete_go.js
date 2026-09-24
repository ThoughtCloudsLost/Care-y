/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Wizard_Complete_GoInputs */

const en_onboarding_wizard_complete_go = /** @type {(inputs: Onboarding_Wizard_Complete_GoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Go to Overview`)
};

const es_onboarding_wizard_complete_go = /** @type {(inputs: Onboarding_Wizard_Complete_GoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ir al Resumen`)
};

const en_xa2_onboarding_wizard_complete_go = /** @type {(inputs: Onboarding_Wizard_Complete_GoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Gò tò Òvèrvìèw •••••⟧`)
};

/**
* | output |
* | --- |
* | "Go to Overview" |
*
* @param {Onboarding_Wizard_Complete_GoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_go = /** @type {((inputs?: Onboarding_Wizard_Complete_GoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Wizard_Complete_GoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_wizard_complete_go(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_wizard_complete_go(inputs)
	return en_onboarding_wizard_complete_go(inputs)
});