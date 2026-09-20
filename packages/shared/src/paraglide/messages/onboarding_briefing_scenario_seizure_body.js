/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Seizure_BodyInputs */

const en_onboarding_briefing_scenario_seizure_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An attacker with full access to the server's database gets encrypted data they cannot read. Client tickets, messages, case notes, and volunteer details remain locked. Decryption requires the volunteer's password plus both verification servers in two different countries. A seizure in one country is not enough.`)
};

const es_onboarding_briefing_scenario_seizure_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un atacante con acceso completo a la base de datos obtiene datos cifrados que no puede leer. Tickets, mensajes, notas de caso y detalles de voluntarios permanecen bloqueados. Descifrar requiere la contraseña del voluntario más ambos servidores de verificación en dos paises distintos. Una confiscación en un país no es suficiente.`)
};

const en_xa2_onboarding_briefing_scenario_seizure_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Seizure_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àttàckèr wìth fùll àccèss tò thè sèrvèr's dàtàbàsè gèts èncryptèd dàtà thèy cànnòt rèàd. Clìènt tìckèts, mèssàgès, càsè nòtès, ànd vòlùntèèr dètàìls rèmàìn lòckèd. Dècryptìòn rèqùìrès thè vòlùntèèr's pàsswòrd plùs bòth vèrìfìcàtìòn sèrvèrs ìn twò dìffèrènt còùntrìès. À sèìzùrè ìn ònè còùntry ìs nòt ènòùgh. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An attacker with full access to the server's database gets encrypted data they cannot read. Client tickets, messages, case notes, and volunteer details remai..." |
*
* @param {Onboarding_Briefing_Scenario_Seizure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_seizure_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Seizure_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Seizure_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_seizure_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_seizure_body(inputs)
	return en_onboarding_briefing_scenario_seizure_body(inputs)
});