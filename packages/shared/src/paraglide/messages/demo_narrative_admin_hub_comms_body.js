/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Hub_Comms_BodyInputs */

const en_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The communications group configures outbound channels, inbound routing, and reusable content across these destinations: [[#permissions #telephony]]
- Phone lines manages the numbers the provider account holds. Editing requires the Manage infrastructure permission.
- Greetings manages the recordings and text an inbound caller hears. Editing requires the Write call greetings permission.
- SMS templates manages the automatic replies sent to inbound texts. Editing requires the Write automatic replies permission.
- Blocklist manages the numbers rejected on contact. Editing requires the Manage infrastructure permission.
- Voicemail quarantine reviews voicemails from callers the system could not route. Reviewing requires the Manage voicemail quarantine permission.
- Saved replies manages reusable message drafts volunteers can insert when composing. Editing requires the Manage presets permission.
**What does the server store in plaintext?** Greetings and SMS templates are plaintext columns, because the telephony provider speaks a greeting and sends a template to someone who has not signed in. A blocked number is sealed with the organization key for browser display, and the server matches it using a keyed index it computes itself. A saved reply is organization-key ciphertext. [Blocklist](#admin-comms/blocklist) covers the matching and its limits. [[#server-holds #encryption]]
**When do warning marks appear?** The hub marks three destinations when the organization is missing a prerequisite for inbound contact. No provisioned phone line means no call or text can arrive. No greeting means an inbound call has nothing to play to the caller. No SMS template means an inbound text gets no automatic reply. Viewing the marks requires the Manage roles permission; an account that holds only communications permissions does not see them. [Phone lines](#admin-comms/phone-lines) covers what provisioning a line involves. [[#failure-states #telephony]]`)
};

const es_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El grupo de comunicaciones configura canales de salida, enrutamiento de entrada y contenido reutilizable en estos destinos: [[#permissions #telephony]]
- Líneas telefónicas gestiona los números que tiene la cuenta del proveedor. Editar requiere el permiso Gestionar infraestructura.
- Saludos gestiona las grabaciones y el texto que escucha la persona que llama. Editar requiere el permiso Escribir saludos de llamada.
- Plantillas SMS gestiona las respuestas automáticas enviadas a textos entrantes. Editar requiere el permiso Escribir respuestas automáticas.
- Lista de bloqueo gestiona los números rechazados al contactar. Editar requiere el permiso Gestionar infraestructura.
- Cuarentena de correo de voz revisa los mensajes de voz de personas que el sistema no pudo enrutar. Revisar requiere el permiso Gestionar cuarentena de correo de voz.
- Respuestas guardadas gestiona borradores de mensaje reutilizables que las personas voluntarias pueden insertar al redactar. Editar requiere el permiso Gestionar plantillas.
**¿Qué guarda el servidor en texto plano?** Los saludos y las plantillas SMS se guardan en columnas de texto plano, porque el proveedor de telefonía pronuncia un saludo y envía una plantilla a alguien que no ha iniciado sesión. Un número bloqueado se sella con la clave de la organización para mostrarlo en el navegador, y el servidor lo compara usando un índice con clave que él mismo calcula. Una respuesta guardada es texto cifrado con la clave de la organización. [Lista de bloqueo](#admin-comms/blocklist) trata la comparación y sus límites. [[#server-holds #encryption]]
**¿Cuándo aparecen las marcas de aviso?** El hub marca tres destinos cuando a la organización le falta un requisito para el contacto entrante. Sin línea telefónica aprovisionada no puede llegar ninguna llamada ni texto. Sin saludo, una llamada entrante no tiene nada que reproducir. Sin plantilla SMS, un texto entrante no recibe respuesta automática. Ver las marcas requiere el permiso Gestionar roles; una cuenta que solo tiene permisos de comunicaciones no las ve. [Líneas telefónicas](#admin-comms/phone-lines) trata qué implica aprovisionar una línea. [[#failure-states #telephony]]`)
};

const en_xa2_demo_narrative_admin_hub_comms_body = /** @type {(inputs: Demo_Narrative_Admin_Hub_Comms_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còmmùnìcàtìòns gròùp cònfìgùrès òùtbòùnd chànnèls, ìnbòùnd ròùtìng, ànd rèùsàblè còntènt àcròss thèsè dèstìnàtìòns: [[#pèrmìssìòns #tèlèphòny]]
- Phònè lìnès mànàgès thè nùmbèrs thè pròvìdèr àccòùnt hòlds. Èdìtìng rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn.
- Grèètìngs mànàgès thè rècòrdìngs ànd tèxt àn ìnbòùnd càllèr hèàrs. Èdìtìng rèqùìrès thè Wrìtè càll grèètìngs pèrmìssìòn.
- SMS tèmplàtès mànàgès thè àùtòmàtìc rèplìès sènt tò ìnbòùnd tèxts. Èdìtìng rèqùìrès thè Wrìtè àùtòmàtìc rèplìès pèrmìssìòn.
- Blòcklìst mànàgès thè nùmbèrs rèjèctèd òn còntàct. Èdìtìng rèqùìrès thè Mànàgè ìnfràstrùctùrè pèrmìssìòn.
- Vòìcèmàìl qùàràntìnè rèvìèws vòìcèmàìls fròm càllèrs thè systèm còùld nòt ròùtè. Rèvìèwìng rèqùìrès thè Mànàgè vòìcèmàìl qùàràntìnè pèrmìssìòn.
- Sàvèd rèplìès mànàgès rèùsàblè mèssàgè dràfts vòlùntèèrs càn ìnsèrt whèn còmpòsìng. Èdìtìng rèqùìrès thè Mànàgè prèsèts pèrmìssìòn.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr stòrè ìn plàìntèxt? ••••••••••••** Grèètìngs ànd SMS tèmplàtès àrè plàìntèxt còlùmns, bècàùsè thè tèlèphòny pròvìdèr spèàks à grèètìng ànd sènds à tèmplàtè tò sòmèònè whò hàs nòt sìgnèd ìn. À blòckèd nùmbèr ìs sèàlèd wìth thè òrgànìzàtìòn kèy fòr bròwsèr dìsplày, ànd thè sèrvèr màtchès ìt ùsìng à kèyèd ìndèx ìt còmpùtès ìtsèlf. À sàvèd rèply ìs òrgànìzàtìòn-kèy cìphèrtèxt. [Blòcklìst](#àdmìn-còmms/blòcklìst) còvèrs thè màtchìng ànd ìts lìmìts. [[#sèrvèr-hòlds #èncryptìòn]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn dò wàrnìng màrks àppèàr? •••••••••** Thè hùb màrks thrèè dèstìnàtìòns whèn thè òrgànìzàtìòn ìs mìssìng à prèrèqùìsìtè fòr ìnbòùnd còntàct. Nò pròvìsìònèd phònè lìnè mèàns nò càll òr tèxt càn àrrìvè. Nò grèètìng mèàns àn ìnbòùnd càll hàs nòthìng tò plày tò thè càllèr. Nò SMS tèmplàtè mèàns àn ìnbòùnd tèxt gèts nò àùtòmàtìc rèply. Vìèwìng thè màrks rèqùìrès thè Mànàgè ròlès pèrmìssìòn; àn àccòùnt thàt hòlds ònly còmmùnìcàtìòns pèrmìssìòns dòès nòt sèè thèm. [Phònè lìnès](#àdmìn-còmms/phònè-lìnès) còvèrs whàt pròvìsìònìng à lìnè ìnvòlvès. [[#fàìlùrè-stàtès #tèlèphòny]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The communications group configures outbound channels, inbound routing, and reusable content across these destinations: [[#permissions #telephony]] - Phone l..." |
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