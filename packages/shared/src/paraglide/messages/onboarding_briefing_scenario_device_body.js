/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Device_BodyInputs */

const en_onboarding_briefing_scenario_device_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`While that volunteer is logged in, the attacker can see everything the volunteer can see. This is the one scenario CARE-Y cannot fully prevent. You can limit the damage by assigning volunteers only to needed tickets, requiring hardware security keys, and training volunteers to recognize compromised devices.`)
};

const es_onboarding_briefing_scenario_device_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mientras ese voluntario esta autenticado, el atacante puede ver todo lo que el voluntario puede ver. Este es el único escenario que CARE-Y no puede prevenir completamente. Puedes limitar el dano asignando voluntarios solo a los tickets necesarios, requiriendo llaves de seguridad fisicas y capacitando a los voluntarios para reconocer dispositivos comprometidos.`)
};

const en_xa2_onboarding_briefing_scenario_device_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Device_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whìlè thàt vòlùntèèr ìs lòggèd ìn, thè àttàckèr càn sèè èvèrythìng thè vòlùntèèr càn sèè. Thìs ìs thè ònè scènàrìò CÀRÈ-Y cànnòt fùlly prèvènt. Yòù càn lìmìt thè dàmàgè by àssìgnìng vòlùntèèrs ònly tò nèèdèd tìckèts, rèqùìrìng hàrdwàrè sècùrìty kèys, ànd tràìnìng vòlùntèèrs tò rècògnìzè còmpròmìsèd dèvìcès. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "While that volunteer is logged in, the attacker can see everything the volunteer can see. This is the one scenario CARE-Y cannot fully prevent. You can limit..." |
*
* @param {Onboarding_Briefing_Scenario_Device_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_device_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Device_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Device_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_device_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_device_body(inputs)
	return en_onboarding_briefing_scenario_device_body(inputs)
});