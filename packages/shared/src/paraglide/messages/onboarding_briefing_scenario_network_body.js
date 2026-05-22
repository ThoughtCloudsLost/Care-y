/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Network_BodyInputs */

const en_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone monitoring internet traffic can see that a person is connecting to your server and determine their location by IP address. They cannot read what is being sent, but knowing someone connects to your service at all can be dangerous. A VPN hides this connection from your local network and internet provider by routing traffic through a separate server. For stronger protection, Tor hides the connection from everyone, including the VPN provider. Your org can recommend or require either option depending on the threat level.`)
};

const es_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alguien monitoreando el trafico de internet puede ver que una persona se conecta a tu servidor y determinar su ubicacion por direccion IP. No pueden leer lo que se envia, pero saber que alguien se conecta a tu servicio ya puede ser peligroso. Una VPN oculta esta conexion de tu red local y proveedor de internet al enrutar el trafico a traves de un servidor separado. Para mayor proteccion, Tor oculta la conexion de todos, incluyendo al proveedor de VPN. Tu organizacion puede recomendar o requerir cualquiera de las dos opciones segun el nivel de amenaza.`)
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