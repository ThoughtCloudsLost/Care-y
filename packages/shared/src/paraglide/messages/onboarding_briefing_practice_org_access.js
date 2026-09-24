/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Org_AccessInputs */

const en_onboarding_briefing_practice_org_access = /** @type {(inputs: Onboarding_Briefing_Practice_Org_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Any logged-in volunteer in your org`)
};

const es_onboarding_briefing_practice_org_access = /** @type {(inputs: Onboarding_Briefing_Practice_Org_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cualquier voluntario autenticado en tu organización`)
};

const en_xa2_onboarding_briefing_practice_org_access = /** @type {(inputs: Onboarding_Briefing_Practice_Org_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àny lòggèd-ìn vòlùntèèr ìn yòùr òrg •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Any logged-in volunteer in your org" |
*
* @param {Onboarding_Briefing_Practice_Org_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_org_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Org_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Org_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_org_access(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_org_access(inputs)
	return en_onboarding_briefing_practice_org_access(inputs)
});