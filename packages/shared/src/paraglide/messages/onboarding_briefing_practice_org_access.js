/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Org_AccessInputs */

const en_onboarding_briefing_practice_org_access = /** @type {(inputs: Onboarding_Briefing_Practice_Org_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Any logged-in volunteer in your org`)
};

const es_onboarding_briefing_practice_org_access = /** @type {(inputs: Onboarding_Briefing_Practice_Org_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cualquier voluntario autenticado en tu organizacion`)
};

/**
* | output |
* | --- |
* | "Any logged-in volunteer in your org" |
*
* @param {Onboarding_Briefing_Practice_Org_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_org_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Org_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Org_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_org_access(inputs)
	return es_onboarding_briefing_practice_org_access(inputs)
});