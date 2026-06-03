/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Choice_Telephony_WhyInputs */

const en_onboarding_briefing_choice_telephony_why = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`If someone gains access to your phone provider's records, they could see who called whom, when, and for how long. A managed provider holds these records. A self-hosted setup keeps them on your own servers instead.`)
};

const es_onboarding_briefing_choice_telephony_why = /** @type {(inputs: Onboarding_Briefing_Choice_Telephony_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Si alguien accede a los registros de tu proveedor telefonico, podria ver quien llamo a quien, cuando y por cuanto tiempo. Un proveedor gestionado guarda estos registros. Una configuracion auto-alojada los mantiene en tus propios servidores.`)
};

/**
* | output |
* | --- |
* | "If someone gains access to your phone provider's records, they could see who called whom, when, and for how long. A managed provider holds these records. A s..." |
*
* @param {Onboarding_Briefing_Choice_Telephony_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_choice_telephony_why = /** @type {((inputs?: Onboarding_Briefing_Choice_Telephony_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Choice_Telephony_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_choice_telephony_why(inputs)
	return es_onboarding_briefing_choice_telephony_why(inputs)
});