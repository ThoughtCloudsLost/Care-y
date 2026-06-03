/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Wizard_Complete_HeadingInputs */

const en_onboarding_wizard_complete_heading = /** @type {(inputs: Onboarding_Wizard_Complete_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Setup Complete`)
};

const es_onboarding_wizard_complete_heading = /** @type {(inputs: Onboarding_Wizard_Complete_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuracion completa`)
};

/**
* | output |
* | --- |
* | "Setup Complete" |
*
* @param {Onboarding_Wizard_Complete_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_heading = /** @type {((inputs?: Onboarding_Wizard_Complete_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Wizard_Complete_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_wizard_complete_heading(inputs)
	return es_onboarding_wizard_complete_heading(inputs)
});