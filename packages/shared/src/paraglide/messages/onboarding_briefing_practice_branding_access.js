/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Branding_AccessInputs */

const en_onboarding_briefing_practice_branding_access = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Anyone who visits your intake page`)
};

const es_onboarding_briefing_practice_branding_access = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cualquier persona que visite tu página de contacto`)
};

const en_xa2_onboarding_briefing_practice_branding_access = /** @type {(inputs: Onboarding_Briefing_Practice_Branding_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ànyònè whò vìsìts yòùr ìntàkè pàgè •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Anyone who visits your intake page" |
*
* @param {Onboarding_Briefing_Practice_Branding_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_branding_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Branding_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Branding_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_branding_access(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_branding_access(inputs)
	return en_onboarding_briefing_practice_branding_access(inputs)
});