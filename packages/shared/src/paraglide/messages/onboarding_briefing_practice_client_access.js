/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Client_AccessInputs */

const en_onboarding_briefing_practice_client_access = /** @type {(inputs: Onboarding_Briefing_Practice_Client_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Only the specific volunteers assigned to that ticket`)
};

const es_onboarding_briefing_practice_client_access = /** @type {(inputs: Onboarding_Briefing_Practice_Client_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Solo los voluntarios asignados a ese ticket`)
};

const en_xa2_onboarding_briefing_practice_client_access = /** @type {(inputs: Onboarding_Briefing_Practice_Client_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ònly thè spècìfìc vòlùntèèrs àssìgnèd tò thàt tìckèt ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Only the specific volunteers assigned to that ticket" |
*
* @param {Onboarding_Briefing_Practice_Client_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_access = /** @type {((inputs?: Onboarding_Briefing_Practice_Client_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Client_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_client_access(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_client_access(inputs)
	return en_onboarding_briefing_practice_client_access(inputs)
});