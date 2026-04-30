/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Telephony_BodyInputs */

const en_onboarding_briefing_choice_telephony_body = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A managed provider can hear your calls and keeps records. Self-hosted voice keeps call audio on your servers, but calls to regular phones still pass through a carrier. Phone calls are never as private as the encrypted web chat.`)
};

const es_onboarding_briefing_choice_telephony_body = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un proveedor gestionado puede escuchar tus llamadas y mantiene registros. La voz auto-alojada mantiene el audio en tus servidores, pero las llamadas a telefonos regulares aun pasan por un operador. Las llamadas telefonicas nunca son tan privadas como el chat cifrado.`)
};

/**
* | output |
* | --- |
* | "A managed provider can hear your calls and keeps records. Self-hosted voice keeps call audio on your servers, but calls to regular phones still pass through ..." |
*
* @param {Onboarding_Briefing_Choice_Telephony_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_body = /** @type {((inputs?: Onboarding_Briefing_Choice_Telephony_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Telephony_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_telephony_body(inputs)
	return es_onboarding_briefing_choice_telephony_body(inputs)
});