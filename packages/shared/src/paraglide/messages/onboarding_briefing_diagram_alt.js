/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Diagram_AltInputs */

const en_onboarding_briefing_diagram_alt = /** @type {(inputs: Onboarding_Briefing_Diagram_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simplified diagram showing how CARE-Y derives encryption keys from passwords using two verification servers`)
};

const es_onboarding_briefing_diagram_alt = /** @type {(inputs: Onboarding_Briefing_Diagram_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Diagrama simplificado mostrando como CARE-Y deriva claves de cifrado a partir de contraseñas usando dos servidores de verificación`)
};

const en_xa2_onboarding_briefing_diagram_alt = /** @type {(inputs: Onboarding_Briefing_Diagram_AltInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìmplìfìèd dìàgràm shòwìng hòw CÀRÈ-Y dèrìvès èncryptìòn kèys fròm pàsswòrds ùsìng twò vèrìfìcàtìòn sèrvèrs •••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Simplified diagram showing how CARE-Y derives encryption keys from passwords using two verification servers" |
*
* @param {Onboarding_Briefing_Diagram_AltInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_diagram_alt = /** @type {((inputs?: Onboarding_Briefing_Diagram_AltInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Diagram_AltInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_diagram_alt(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_diagram_alt(inputs)
	return en_onboarding_briefing_diagram_alt(inputs)
});