/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Insider_BodyInputs */

const en_onboarding_briefing_scenario_insider_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A volunteer can read any ticket they are assigned to. Once they have seen decrypted data, no technical control can undo that. Limit damage by assigning the minimum tickets needed, monitoring audit logs, and removing access promptly when a volunteer leaves.`)
};

const es_onboarding_briefing_scenario_insider_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un voluntario puede leer cualquier ticket al que este asignado. Una vez que ha visto datos descifrados, ningun control tecnico puede deshacerlo. Limita el dano asignando el minimo de tickets necesarios, monitoreando registros de auditoria y removiendo el acceso cuando un voluntario se va.`)
};

/**
* | output |
* | --- |
* | "A volunteer can read any ticket they are assigned to. Once they have seen decrypted data, no technical control can undo that. Limit damage by assigning the m..." |
*
* @param {Onboarding_Briefing_Scenario_Insider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_insider_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Insider_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Insider_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_insider_body(inputs)
	return es_onboarding_briefing_scenario_insider_body(inputs)
});