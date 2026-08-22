/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Compose_Actions_BodyInputs */

const en_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The compose bar is accessed via the + icon at the bottom of the screen and is where volunteers write replies to clients and internal notes to other org members.
**Mode switching.** The compose bar can switch between reply mode and internal note mode. In reply mode, the message is sent to the client. In note mode, it is visible only to other org members.
**Channel selection.** When the client has multiple contact methods, such as SMS text or web reply, the compose bar lets the volunteer choose which channel to send through.
**While typing.** Typing @ in a reply suggests other volunteers to mention, and in SMS mode a character counter tracks the message length.
**Attachments.** Files attached to a ticket are encrypted with the per ticket key on the server using XChaCha20-Poly1305 and stored as encrypted binary data. The server can never decrypt stored attachments. Volunteers download and decrypt them in the browser.`)
};

const es_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La barra de composición se accede a través del icono + en la parte inferior de la pantalla y es donde los voluntarios escriben respuestas a clientes y notas internas a otros miembros de la organización.
**Cambio de modo.** La barra de composición puede alternar entre modo de respuesta y modo de nota interna. En modo de respuesta, el mensaje se envía al cliente. En modo de nota, solo es visible para otros miembros de la organización.
**Selección de canal.** Cuando el cliente tiene varios métodos de contacto, como SMS o respuesta web, la barra de composición permite al voluntario elegir por qué canal enviar.
**Mientras se escribe.** Escribir @ en una respuesta sugiere otros voluntarios para mencionar, y en modo SMS un contador de caracteres registra la longitud del mensaje.
**Adjuntos.** Los archivos adjuntos a un ticket se cifran con la clave por ticket en el servidor usando XChaCha20-Poly1305 y se almacenan como datos binarios cifrados. El servidor nunca puede descifrar los adjuntos almacenados. Los voluntarios los descargan y descifran en el navegador.`)
};

/**
* | output |
* | --- |
* | "The compose bar is accessed via the + icon at the bottom of the screen and is where volunteers write replies to clients and internal notes to other org membe..." |
*
* @param {Demo_Narrative_Topic_Compose_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_compose_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Compose_Actions_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Compose_Actions_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_compose_actions_body(inputs)
	return es_demo_narrative_topic_compose_actions_body(inputs)
});