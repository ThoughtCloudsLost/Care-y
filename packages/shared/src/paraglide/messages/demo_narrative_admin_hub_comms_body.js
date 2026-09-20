/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Comms_BodyInputs */

const en_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`External channel configuration: telephony provider, voicemail greetings, SMS templates, the number blocklist, and the voicemail quarantine. These settings control how the organization reaches clients and how inbound messages are routed.`)
};

const es_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configuración de canales externos: proveedor de telefonía, saludos de buzón de voz, plantillas de SMS, la lista de bloqueo de números y la cuarentena de buzón de voz. Estos ajustes controlan cómo la organización contacta a los clientes y cómo se enrutan los mensajes entrantes.`)
};

const en_xa2_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxtèrnàl chànnèl cònfìgùràtìòn: tèlèphòny pròvìdèr, vòìcèmàìl grèètìngs, SMS tèmplàtès, thè nùmbèr blòcklìst, ànd thè vòìcèmàìl qùàràntìnè. Thèsè sèttìngs còntròl hòw thè òrgànìzàtìòn rèàchès clìènts ànd hòw ìnbòùnd mèssàgès àrè ròùtèd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "External channel configuration: telephony provider, voicemail greetings, SMS templates, the number blocklist, and the voicemail quarantine. These settings co..." |
*
* @param {Demo_Narrative_Admin_Hub_Comms_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_hub_comms_body = /** @type {((inputs?: Demo_Narrative_Admin_Hub_Comms_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Hub_Comms_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_hub_comms_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_hub_comms_body(inputs)
	return en_demo_narrative_admin_hub_comms_body(inputs)
});