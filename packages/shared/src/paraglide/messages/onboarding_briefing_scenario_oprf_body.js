/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Oprf_BodyInputs */

const en_onboarding_briefing_scenario_oprf_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An attacker gets one half of the verification process, which is useless on its own. The other half is on a server in a different country under different legal jurisdiction. Even with one half, they cannot derive any volunteer's decryption keys. The verification shares are refreshed regularly.`)
};

const es_onboarding_briefing_scenario_oprf_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un atacante obtiene la mitad del proceso de verificacion, que es inutil por si sola. La otra mitad esta en un servidor en otro pais bajo otra jurisdiccion legal. Ni siquiera con una mitad pueden derivar las claves de cifrado de ningun voluntario. Las partes de verificacion se renuevan regularmente.`)
};

/**
* | output |
* | --- |
* | "An attacker gets one half of the verification process, which is useless on its own. The other half is on a server in a different country under different lega..." |
*
* @param {Onboarding_Briefing_Scenario_Oprf_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_oprf_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Oprf_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Oprf_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_oprf_body(inputs)
	return es_onboarding_briefing_scenario_oprf_body(inputs)
});