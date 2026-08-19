/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Compose_Actions_BodyInputs */

const en_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The compose bar at the bottom of the screen is where volunteers write replies and notes.
**Mode switching.** The compose bar can switch between reply mode and internal note mode. In reply mode, the message is sent to the client. In note mode, it is visible only to other volunteers.
**Channel selection.** When the client has multiple contact methods, the compose bar lets the volunteer choose which channel to send through.
**While typing.** Typing @ in a reply suggests other volunteers to mention, and in SMS mode a character counter tracks the message length.
**Attachments.** Files attached to a ticket are encrypted with the per ticket key on the server using XChaCha20-Poly1305 and stored as encrypted binary data. The server never decrypts stored attachments. Volunteers download and decrypt them in the browser.`)
};

const es_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La barra de composicion en la parte inferior de la pantalla es donde los voluntarios escriben respuestas y notas.
**Cambio de modo.** La barra de composicion puede alternar entre modo de respuesta y modo de nota interna. En modo de respuesta, el mensaje se envia al cliente. En modo de nota, solo es visible para otros voluntarios.
**Seleccion de canal.** Cuando el cliente tiene varios metodos de contacto, la barra de composicion permite al voluntario elegir por que canal enviar.
**Mientras se escribe.** Escribir @ en una respuesta sugiere otros voluntarios para mencionar, y en modo SMS un contador de caracteres registra la longitud del mensaje.
**Adjuntos.** Los archivos adjuntos a un ticket se cifran con la clave por ticket en el servidor usando XChaCha20-Poly1305 y se almacenan como datos binarios cifrados. El servidor nunca descifra los adjuntos almacenados. Los voluntarios los descargan y descifran en el navegador.`)
};

/**
* | output |
* | --- |
* | "The compose bar at the bottom of the screen is where volunteers write replies and notes. **Mode switching.** The compose bar can switch between reply mode an..." |
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