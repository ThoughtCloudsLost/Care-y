/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Channel_Policy_BodyInputs */

const en_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The channel policy decides which of five communication channels an organization uses, one switch each for SMS, email, secure links, voice and share links, and every channel starts on. Any signed-in account reads the policy; changing it needs permission to manage channel routing. [[#telephony #permissions]]
**What a disabled channel does to ticket work.** Ticket detail reads four of the five switches. With voice off, a ticket offers no call action; with share links off, no share action; with secure links off, no offer to set the client up with a portal; with SMS off, no delivery of a secure link by text. The email switch is read where a reply to an inbound email would be composed. An account is never offered a channel the organization turned off rather than being refused after trying it. [[#permissions]]
**What happens to traffic on a disabled channel.** The server refuses at the same point it refuses a blocked number. An outbound text is answered with SMS_DISABLED and an outbound call with VOICE_DISABLED before any provider credential is decrypted, an inbound text is dropped without creating a ticket, an inbound call is rejected as busy, and inbound email is refused at the step that rejects an unknown recipient. [[#trust-boundary]]
**What the switches record.** Five plaintext booleans on the organization config row, so a database dump shows which channels an organization runs and nothing about what moved through them. Turning a channel off stops new traffic and removes nothing already stored; turning it back on restores the actions with no further configuration. [[#server-holds #metadata]]
**The columns and the loading default.** \`111_channel_policy.ts\` adds the five columns with a true default, \`getChannelPolicy\` in \`packages/server/src/org/org-config-service.ts\` reads any absent value as enabled, and the update mutation writes one flag at a time. The browser query in \`packages/client/src/lib/query/channel-policy.svelte.ts\` answers true for every channel while it loads, so an action can be offered for a moment before the policy arrives and the server refusal is what holds. The same section is a step in organization setup. [[#failure-states]]`)
};

const es_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La política de canales decide cuáles de los cinco canales de comunicación usa una organización, con un interruptor para SMS, correo, enlaces seguros, voz y enlaces compartidos, y todos los canales empiezan activados. Cualquier cuenta con sesión iniciada lee la política; cambiarla requiere permiso para gestionar el enrutamiento de canales. [[#telephony #permissions]]
**Qué le hace al trabajo en un ticket un canal desactivado.** El detalle del ticket lee cuatro de los cinco interruptores. Con la voz desactivada, un ticket no ofrece la acción de llamar; con los enlaces compartidos desactivados, no ofrece la de compartir; con los enlaces seguros desactivados, no ofrece dar de alta al cliente en el portal; con el SMS desactivado, no ofrece enviar un enlace seguro por mensaje de texto. El interruptor de correo se lee donde se redactaría una respuesta a un correo entrante. A una cuenta nunca se le ofrece un canal que la organización desactivó, en lugar de recibir un rechazo después de intentarlo. [[#permissions]]
**Qué ocurre con el tráfico de un canal desactivado.** El servidor lo rechaza en el mismo punto en que rechaza un número bloqueado. Un mensaje de texto saliente recibe SMS_DISABLED y una llamada saliente VOICE_DISABLED antes de descifrar ninguna credencial del proveedor, un mensaje entrante se descarta sin crear ningún ticket, una llamada entrante se rechaza como ocupada y el correo entrante se rechaza en el paso que rechaza a un destinatario desconocido. [[#trust-boundary]]
**Lo que registran los interruptores.** Cinco booleanos en texto plano en la fila de configuración de la organización, de modo que un volcado de la base de datos muestra qué canales usa una organización y nada sobre lo que pasó por ellos. Desactivar un canal detiene el tráfico nuevo y no elimina nada de lo ya guardado; volver a activarlo restablece las acciones sin ninguna otra configuración. [[#server-holds #metadata]]
**Las columnas y el valor por defecto durante la carga.** \`111_channel_policy.ts\` añade las cinco columnas con un valor por defecto verdadero, \`getChannelPolicy\`, en \`packages/server/src/org/org-config-service.ts\`, lee como activado cualquier valor ausente, y la mutación de actualización escribe una marca cada vez. La consulta del navegador de \`packages/client/src/lib/query/channel-policy.svelte.ts\` responde verdadero para todos los canales mientras carga, así que una acción puede ofrecerse un instante antes de que llegue la política y lo que se sostiene es el rechazo del servidor. Esa misma sección es un paso de la configuración inicial de la organización. [[#failure-states]]`)
};

const en_xa2_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè chànnèl pòlìcy còntròls whìch còmmùnìcàtìòn chànnèls àrè àvàìlàblè àcròss thè òrgànìzàtìòn, wìth fìvè chànnèls thàt èàch hàvè àn ìndèpèndènt tògglè.
 ••••••••••••••••••••••••••••••••••••••••••••••**Èffèct òn ùsèrs. •••••** À dìsàblèd chànnèl dìsàppèàrs fròm còmpòsè àctìòns ànd fròm àny còntròl thàt wòùld ùsè ìt, sò à ùsèr wòrkìng à tìckèt nèvèr sèès àn òptìòn thè òrgànìzàtìòn hàs tùrnèd òff. Thè pòlìcy ìs àlsò ènfòrcèd òn thè sèrvèr, nòt ònly ìn thè ìntèrfàcè, sò à dìrèct rèqùèst fòr à dìsàblèd chànnèl ìs rèjèctèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ònbòàrdìng. ••••** Thè chànnèl pòlìcy àlsò àppèàrs dùrìng thè òrgànìzàtìòn sètùp flòw òn thè còmmùnìcàtìòns stèp, sò thè ìnìtìàl chànnèl àvàìlàbìlìty càn bè sèt bèfòrè ànyònè stàrts wòrkìng tìckèts.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Chàngìng thè chànnèl pòlìcy rèqùìrès thè Mànàgè chànnèl ròùtìng pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The channel policy decides which of five communication channels an organization uses, one switch each for SMS, email, secure links, voice and share links, an..." |
*
* @param {Demo_Narrative_Admin_Channel_Policy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_channel_policy_body = /** @type {((inputs?: Demo_Narrative_Admin_Channel_Policy_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Channel_Policy_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_channel_policy_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_channel_policy_body(inputs)
	return en_demo_narrative_admin_channel_policy_body(inputs)
});