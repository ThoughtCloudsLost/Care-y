/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Device_BodyInputs */

const en_onboarding_briefing_scenario_device_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`While that volunteer is logged in, the attacker can see everything the volunteer can see. This is the one scenario CARE-Y cannot fully prevent. You can limit the damage by assigning volunteers only to needed tickets, requiring hardware security keys, and training volunteers to recognize compromised devices.`)
};

const es_onboarding_briefing_scenario_device_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mientras ese voluntario esta autenticado, el atacante puede ver todo lo que el voluntario puede ver. Este es el unico escenario que CARE-Y no puede prevenir completamente. Puedes limitar el dano asignando voluntarios solo a los tickets necesarios, requiriendo llaves de seguridad fisicas y capacitando a los voluntarios para reconocer dispositivos comprometidos.`)
};

/**
* | output |
* | --- |
* | "While that volunteer is logged in, the attacker can see everything the volunteer can see. This is the one scenario CARE-Y cannot fully prevent. You can limit..." |
*
* @param {Onboarding_Briefing_Scenario_Device_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_device_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Device_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Device_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_device_body(inputs)
	return es_onboarding_briefing_scenario_device_body(inputs)
});