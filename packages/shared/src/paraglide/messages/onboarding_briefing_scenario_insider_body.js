/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Insider_BodyInputs */

const en_onboarding_briefing_scenario_insider_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A volunteer can read any ticket they are assigned to. Once they have seen decrypted data, no technical control can undo that. Limit damage by assigning the minimum tickets needed, monitoring audit logs, and removing access promptly when a volunteer leaves.`)
};

const es_onboarding_briefing_scenario_insider_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un voluntario puede leer cualquier ticket al que este asignado. Una vez que ha visto datos descifrados, ningún control tecnico puede deshacerlo. Limita el dano asignando el mínimo de tickets necesarios, monitoreando registros de auditoría y removiendo el acceso cuando un voluntario se va.`)
};

const en_xa2_onboarding_briefing_scenario_insider_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Insider_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À vòlùntèèr càn rèàd àny tìckèt thèy àrè àssìgnèd tò. Òncè thèy hàvè sèèn dècryptèd dàtà, nò tèchnìcàl còntròl càn ùndò thàt. Lìmìt dàmàgè by àssìgnìng thè mìnìmùm tìckèts nèèdèd, mònìtòrìng àùdìt lògs, ànd rèmòvìng àccèss pròmptly whèn à vòlùntèèr lèàvès. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A volunteer can read any ticket they are assigned to. Once they have seen decrypted data, no technical control can undo that. Limit damage by assigning the m..." |
*
* @param {Onboarding_Briefing_Scenario_Insider_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_insider_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Insider_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Insider_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_insider_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_insider_body(inputs)
	return en_onboarding_briefing_scenario_insider_body(inputs)
});