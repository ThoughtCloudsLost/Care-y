/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Network_BodyInputs */

const en_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone monitoring internet traffic can see that a person is connecting to your server and determine their location by IP address. They cannot read what is being sent. If your org enables Tor hidden service access, volunteers and clients can hide their connection entirely.`)
};

const es_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alguien monitoreando el trafico de internet puede ver que una persona se conecta a tu servidor y determinar su ubicacion por direccion IP. No pueden leer lo que se envia. Si tu organizacion habilita el acceso por servicio oculto Tor, voluntarios y clientes pueden ocultar su conexion completamente.`)
};

/**
* | output |
* | --- |
* | "Someone monitoring internet traffic can see that a person is connecting to your server and determine their location by IP address. They cannot read what is b..." |
*
* @param {Onboarding_Briefing_Scenario_Network_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_network_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Network_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Network_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_briefing_scenario_network_body(inputs)
	return es_onboarding_briefing_scenario_network_body(inputs)
});