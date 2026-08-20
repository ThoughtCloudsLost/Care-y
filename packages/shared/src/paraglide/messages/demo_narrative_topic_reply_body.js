/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Reply_BodyInputs */

const en_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a volunteer sends a reply, the message is encrypted on the device with the per ticket key before it reaches the server. The server stores the ciphertext and delivers it to the recipient.
**SMS replies.** If the channel is SMS, the server forwards the message to the telephony provider through a stateless relay that reads the request body as a raw buffer and zeros it from memory immediately after forwarding. The relay never creates a JavaScript string from the content, and the server does not store or log the outbound message. A residual risk is acknowledged in the code: the telephony provider's SDK may create internal string copies that persist until garbage collection.
**Delivery confirmation.** The thread shows delivery status for each outbound message so the volunteer knows whether the message reached the client.`)
};

const es_demo_narrative_topic_reply_body = /** @type {(inputs: Demo_Narrative_Topic_Reply_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un voluntario envía una respuesta, el mensaje se cifra en el dispositivo con la clave por ticket antes de llegar al servidor. El servidor almacena el texto cifrado y lo entrega al destinatario.
**Respuestas por SMS.** Si el canal es SMS, el servidor reenvia el mensaje al proveedor de telefonía a través de un relay sin estado que lee el cuerpo de la solicitud como un buffer crudo y lo borra de memoria inmediatamente después del reenvío. El relay nunca crea una cadena JavaScript del contenido, y el servidor no almacena ni registra el mensaje saliente. Se reconoce un riesgo residual en el código: el SDK del proveedor de telefonía puede crear copias internas de cadenas que persisten hasta la recolección de basura.
**Confirmación de entrega.** El hilo muestra el estado de entrega de cada mensaje saliente para que el voluntario sepa si el mensaje llegó al cliente.`)
};

/**
* | output |
* | --- |
* | "When a volunteer sends a reply, the message is encrypted on the device with the per ticket key before it reaches the server. The server stores the ciphertext..." |
*
* @param {Demo_Narrative_Topic_Reply_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_reply_body = /** @type {((inputs?: Demo_Narrative_Topic_Reply_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Reply_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_reply_body(inputs)
	return es_demo_narrative_topic_reply_body(inputs)
});