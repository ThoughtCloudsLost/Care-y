/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Comms_BodyInputs */

const en_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The communications group configures how the organization reaches a client and how an inbound message is routed, across six destinations behind five different permissions. [[#permissions #telephony]]
**Which of this the server can read.** A call greeting and an automatic reply are stored as plaintext, because the telephony provider is what speaks and sends them to someone who has not signed in to anything. A blocked number is stored encrypted, with a separate hash of it for matching, and a saved reply, which one user writes for another, is organization-key ciphertext. [Blocklist](#admin-comms/blocklist) covers how a match is made without the number. [[#server-holds #encryption]]
**What a warning mark reports.** An organization with no provisioned line, no greeting or no automatic reply is marked here rather than at the destination, since those three are the states that leave an inbound call with nothing to answer it. [Phone lines](#admin-comms/phone-lines) covers what provisioning a line involves. [[#failure-states #telephony]]`)
};

const es_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de comunicaciones configura cómo la organización contacta con un cliente y cómo se enruta un mensaje entrante, en seis destinos detrás de cinco permisos distintos. [[#permissions #telephony]]
**Qué puede leer el servidor de todo esto.** Un saludo de llamada y una respuesta automática se guardan en texto plano, porque el proveedor de telefonía es quien los pronuncia y los envía a alguien que no ha iniciado sesión en nada. Un número bloqueado se guarda cifrado con un hash a su lado para poder compararlo, y una respuesta guardada, que una persona usuaria escribe para otra, es texto cifrado con la clave de la organización. [Lista de bloqueo](#admin-comms/blocklist) trata cómo se compara sin el número. [[#server-holds #encryption]]
**Qué indica una marca de aviso.** Una organización sin ninguna línea aprovisionada, sin saludo o sin respuesta automática queda marcada aquí y no en el destino, porque esos tres son los estados que dejan una llamada entrante sin nada que la atienda. [Líneas telefónicas](#admin-comms/phone-lines) trata qué implica aprovisionar una línea. [[#failure-states #telephony]]`)
};

const en_xa2_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxtèrnàl chànnèl cònfìgùràtìòn: tèlèphòny pròvìdèr, vòìcèmàìl grèètìngs, SMS tèmplàtès, thè nùmbèr blòcklìst, ànd thè vòìcèmàìl qùàràntìnè. Thèsè sèttìngs còntròl hòw thè òrgànìzàtìòn rèàchès clìènts ànd hòw ìnbòùnd mèssàgès àrè ròùtèd. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The communications group configures how the organization reaches a client and how an inbound message is routed, across six destinations behind five different..." |
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