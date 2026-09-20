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

const en_xa2_onboarding_briefing_practice_client_data = /** @type {(inputs: Onboarding_Briefing_Practice_Client_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clìènt dàtà (tìckèts, mèssàgès, càsè nòtès) •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Client data (tickets, messages, case notes)" |
*
* @param {Onboarding_Briefing_Practice_Client_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_practice_client_data = /** @type {((inputs?: Onboarding_Briefing_Practice_Client_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Practice_Client_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_practice_client_data(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_practice_client_data(inputs)
	return en_onboarding_briefing_practice_client_data(inputs)
});