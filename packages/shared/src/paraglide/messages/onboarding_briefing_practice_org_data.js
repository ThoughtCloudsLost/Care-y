/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Org_DataInputs */

const en_onboarding_briefing_practice_org_data = /** @type {(inputs: Onboarding_Briefing_Practice_Org_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Org resources (knowledge base, settings)`)
};

const es_onboarding_briefing_practice_org_data = /** @type {(inputs: Onboarding_Briefing_Practice_Org_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recursos de la organización (base de conocimiento, configuración)`)
};

const en_xa2_onboarding_briefing_practice_org_data = /** @type {(inputs: Onboarding_Briefing_Practice_Org_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrg rèsòùrcès (knòwlèdgè bàsè, sèttìngs) ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Org resources (knowledge base, settings)" |
*
* @param {Onboarding_Briefing_Practice_Org_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_org_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Org_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Org_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_org_data(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_org_data(inputs)
	return en_onboarding_briefing_practice_org_data(inputs)
});