/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Oprf_BodyInputs */

const en_onboarding_briefing_scenario_oprf_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An attacker gets one half of the verification process, which is useless on its own. The other half is on a server in a different country under different legal jurisdiction. Even with one half, they cannot derive any volunteer's decryption keys. The verification shares are refreshed regularly.`)
};

const es_onboarding_briefing_scenario_oprf_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un atacante obtiene la mitad del proceso de verificación, que es inútil por sí sola. La otra mitad esta en un servidor en otro país bajo otra jurisdicción legal. Ni siquiera con una mitad pueden derivar las claves de cifrado de ningún voluntario. Las partes de verificación se renuevan regularmente.`)
};

const en_xa2_onboarding_briefing_scenario_oprf_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Oprf_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àn àttàckèr gèts ònè hàlf òf thè vèrìfìcàtìòn pròcèss, whìch ìs ùsèlèss òn ìts òwn. Thè òthèr hàlf ìs òn à sèrvèr ìn à dìffèrènt còùntry ùndèr dìffèrènt lègàl jùrìsdìctìòn. Èvèn wìth ònè hàlf, thèy cànnòt dèrìvè àny vòlùntèèr's dècryptìòn kèys. Thè vèrìfìcàtìòn shàrès àrè rèfrèshèd règùlàrly. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An attacker gets one half of the verification process, which is useless on its own. The other half is on a server in a different country under different lega..." |
*
* @param {Onboarding_Briefing_Scenario_Oprf_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_oprf_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Oprf_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Oprf_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_oprf_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_oprf_body(inputs)
	return en_onboarding_briefing_scenario_oprf_body(inputs)
});