/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Wizard_Complete_BodyInputs */

const en_onboarding_wizard_complete_body = /** @type {(inputs: Onboarding_Wizard_Complete_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your organization is ready. Here are some things you may want to configure next.`)
};

const es_onboarding_wizard_complete_body = /** @type {(inputs: Onboarding_Wizard_Complete_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu organización está lista. Aquí hay algunas cosas que puedes configurar a continuación.`)
};

const en_xa2_onboarding_wizard_complete_body = /** @type {(inputs: Onboarding_Wizard_Complete_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr òrgànìzàtìòn ìs rèàdy. Hèrè àrè sòmè thìngs yòù mày wànt tò cònfìgùrè nèxt. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your organization is ready. Here are some things you may want to configure next." |
*
* @param {Onboarding_Wizard_Complete_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_wizard_complete_body = /** @type {((inputs?: Onboarding_Wizard_Complete_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Wizard_Complete_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_wizard_complete_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_wizard_complete_body(inputs)
	return en_onboarding_wizard_complete_body(inputs)
});