/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Practice_Client_DataInputs */

const en_onboarding_briefing_practice_client_data = /** @type {(inputs: Onboarding_Briefing_Practice_Client_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client data (tickets, messages, case notes)`)
};

const es_onboarding_briefing_practice_client_data = /** @type {(inputs: Onboarding_Briefing_Practice_Client_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Datos de clientes (tickets, mensajes, notas de caso)`)
};

/**
* | output |
* | --- |
* | "Client data (tickets, messages, case notes)" |
*
* @param {Onboarding_Briefing_Practice_Client_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Client_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Client_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_practice_client_data(inputs)
	return es_onboarding_briefing_practice_client_data(inputs)
});