/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Wizard_Complete_BodyInputs */

const en_onboarding_wizard_complete_body = /** @type {(inputs: Onboarding_Wizard_Complete_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your organization is ready. Here are some things you may want to configure next.`)
};

const es_onboarding_wizard_complete_body = /** @type {(inputs: Onboarding_Wizard_Complete_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu organizacion esta lista. Aqui hay algunas cosas que puedes configurar a continuacion.`)
};

/**
* | output |
* | --- |
* | "Your organization is ready. Here are some things you may want to configure next." |
*
* @param {Onboarding_Wizard_Complete_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_body = /** @type {((inputs?: Onboarding_Wizard_Complete_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Wizard_Complete_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_wizard_complete_body(inputs)
	return es_onboarding_wizard_complete_body(inputs)
});