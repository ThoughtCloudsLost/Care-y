/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Briefing_Scenario_Network_BodyInputs */

const en_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Someone monitoring internet traffic can see that a person is connecting to your server and determine their location by IP address. They cannot read what is being sent, but knowing someone connects to your service at all can be dangerous. A VPN hides this connection from your local network and internet provider by routing traffic through a separate server. For stronger protection, Tor hides the connection from everyone. Even your VPN provider cannot see where the traffic goes. Your org can recommend or require either option depending on the threat level.`)
};

const es_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alguien monitoreando el tráfico de internet puede ver que una persona se conecta a tu servidor y determinar su ubicación por dirección IP. No pueden leer lo que se envia, pero saber que alguien se conecta a tu servicio ya puede ser peligroso. Una VPN oculta esta conexión de tu red local y proveedor de internet al enrutar el tráfico a traves de un servidor separado. Para mayor protección, Tor oculta la conexión de todos. Ni siquiera tu proveedor de VPN puede ver a donde va el tráfico. Tu organización puede recomendar o requerir cualquiera de las dos opciones según el nivel de amenaza.`)
};

const en_xa2_onboarding_briefing_scenario_network_body = /** @type {(inputs: Onboarding_Briefing_Scenario_Network_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòmèònè mònìtòrìng ìntèrnèt tràffìc càn sèè thàt à pèrsòn ìs cònnèctìng tò yòùr sèrvèr ànd dètèrmìnè thèìr lòcàtìòn by ÌP àddrèss. Thèy cànnòt rèàd whàt ìs bèìng sènt, bùt knòwìng sòmèònè cònnècts tò yòùr sèrvìcè àt àll càn bè dàngèròùs. À VPN hìdès thìs cònnèctìòn fròm yòùr lòcàl nètwòrk ànd ìntèrnèt pròvìdèr by ròùtìng tràffìc thròùgh à sèpàràtè sèrvèr. Fòr stròngèr pròtèctìòn, Tòr hìdès thè cònnèctìòn fròm èvèryònè. Èvèn yòùr VPN pròvìdèr cànnòt sèè whèrè thè tràffìc gòès. Yòùr òrg càn rècòmmènd òr rèqùìrè èìthèr òptìòn dèpèndìng òn thè thrèàt lèvèl. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Someone monitoring internet traffic can see that a person is connecting to your server and determine their location by IP address. They cannot read what is b..." |
*
* @param {Onboarding_Briefing_Scenario_Network_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_scenario_network_body = /** @type {((inputs?: Onboarding_Briefing_Scenario_Network_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Briefing_Scenario_Network_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_onboarding_briefing_scenario_network_body(inputs)
	if (locale === "en-XA") return en_xa2_onboarding_briefing_scenario_network_body(inputs)
	return en_onboarding_briefing_scenario_network_body(inputs)
});