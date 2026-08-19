/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Conversation_BodyInputs */

const en_demo_narrative_topic_conversation_body = /** @type {(inputs: Demo_Narrative_Topic_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The main body of the ticket detail is a conversation thread showing messages between the volunteer and the client. Messages appear as bubbles, with the volunteer's messages on one side and the client's on the other.
**Decryption.** Each message is individually encrypted with the per ticket key using XChaCha20-Poly1305. The browser decrypts them locally and the server never sees the plaintext content.
**Channels.** Messages may arrive via different channels. An SMS message from the client and a web reply from the volunteer appear in the same thread. The channel indicator on each message shows how it was sent.`)
};

const es_demo_narrative_topic_conversation_body = /** @type {(inputs: Demo_Narrative_Topic_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El cuerpo principal del detalle del ticket es un hilo de conversación que muestra mensajes entre el voluntario y el cliente. Los mensajes aparecen como burbujas, con los mensajes del voluntario en un lado y los del cliente en el otro.
**Descifrado.** Cada mensaje está cifrado individualmente con la clave por ticket usando XChaCha20-Poly1305. El navegador los descifra localmente y el servidor nunca ve el contenido en texto plano.
**Canales.** Los mensajes pueden llegar por diferentes canales. Un mensaje SMS del cliente y una respuesta web del voluntario aparecen en el mismo hilo. El indicador de canal en cada mensaje muestra cómo fue enviado.`)
};

/**
* | output |
* | --- |
* | "The main body of the ticket detail is a conversation thread showing messages between the volunteer and the client. Messages appear as bubbles, with the volun..." |
*
* @param {Demo_Narrative_Topic_Conversation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_conversation_body = /** @type {((inputs?: Demo_Narrative_Topic_Conversation_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Conversation_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_conversation_body(inputs)
	return es_demo_narrative_topic_conversation_body(inputs)
});