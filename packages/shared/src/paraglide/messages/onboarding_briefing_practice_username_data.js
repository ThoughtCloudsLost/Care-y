/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Username_DataInputs */

const en_onboarding_briefing_practice_username_data = /** @type {(inputs: Onboarding_Briefing_Practice_Username_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer login usernames`)
};

const es_onboarding_briefing_practice_username_data = /** @type {(inputs: Onboarding_Briefing_Practice_Username_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Usuarios de inicio de sesión de voluntarios`)
};

const en_xa2_onboarding_briefing_practice_username_data = /** @type {(inputs: Onboarding_Briefing_Practice_Username_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèr lògìn ùsèrnàmès ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteer login usernames" |
*
* @param {Onboarding_Briefing_Practice_Username_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_username_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Username_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Username_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_username_data(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_username_data(inputs)
	return en_onboarding_briefing_practice_username_data(inputs)
});