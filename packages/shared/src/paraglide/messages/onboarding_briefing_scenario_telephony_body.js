/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Telephony_BodyInputs */

const en_onboarding_briefing_scenario_telephony_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Telephony_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The phone provider can hear calls and read SMS messages. They keep records of who your org called, when, and for how long. Sensitive conversations should happen through the encrypted web chat, not phone calls or text messages.`)
};

const es_onboarding_briefing_scenario_telephony_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Telephony_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El proveedor telefonico puede escuchar llamadas y leer mensajes SMS. Mantienen registros de a quien llamo tu organizacion, cuando y por cuanto tiempo. Las conversaciones sensibles deben hacerse por el chat cifrado, no por llamadas o mensajes de texto.`)
};

/**
* | output |
* | --- |
* | "The phone provider can hear calls and read SMS messages. They keep records of who your org called, when, and for how long. Sensitive conversations should hap..." |
*
* @param {Onboarding_Briefing_Scenario_Telephony_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_telephony_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Telephony_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Telephony_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_telephony_body(inputs)
	return es_onboarding_briefing_scenario_telephony_body(inputs)
});