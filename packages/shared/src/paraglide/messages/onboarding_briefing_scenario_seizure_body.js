/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Seizure_BodyInputs */

const en_onboarding_briefing_scenario_seizure_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An attacker with full access to the server's database gets encrypted data they cannot read. Client tickets, messages, case notes, and volunteer details remain locked. Decryption requires the volunteer's password plus both verification servers in two different countries. A seizure in one country is not enough.`)
};

const es_onboarding_briefing_scenario_seizure_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un atacante con acceso completo a la base de datos obtiene datos cifrados que no puede leer. Tickets, mensajes, notas de caso y detalles de voluntarios permanecen bloqueados. Descifrar requiere la contrasena del voluntario mas ambos servidores de verificacion en dos paises distintos. Una confiscacion en un pais no es suficiente.`)
};

/**
* | output |
* | --- |
* | "An attacker with full access to the server's database gets encrypted data they cannot read. Client tickets, messages, case notes, and volunteer details remai..." |
*
* @param {Onboarding_Briefing_Scenario_Seizure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_seizure_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Seizure_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Seizure_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_seizure_body(inputs)
	return es_onboarding_briefing_scenario_seizure_body(inputs)
});