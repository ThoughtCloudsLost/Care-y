/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Compose_Actions_BodyInputs */

const en_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The + button at the bottom of the screen opens a popover listing the available compose actions. The entries that appear depend on the client's contact methods and the volunteer's permissions.
**Actions.** The popover can show attach file, preset replies, internal note, reply to client, text client via SMS, and email client. Attach opens the device file picker. Preset replies opens a sheet of saved response templates. Internal note opens the note sheet with its type selector.
**Email.** The email entry opens a compose sheet with a subject line and a rich text body editor. A plaintext warning banner appears above the editor because the email leaves the system unencrypted, unlike in-app messages that stay sealed end to end.
**Attachments.** Files attached to a ticket are encrypted with the per ticket key using XChaCha20-Poly1305 and stored as encrypted binary data, and the server can never decrypt stored attachments. Volunteers download and decrypt them in the browser.`)
};

const es_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El botón + en la parte inferior de la pantalla abre un menú emergente con las acciones de composición disponibles. Las entradas que aparecen dependen de los métodos de contacto del cliente y los permisos del voluntario.
**Acciones.** El menú puede mostrar adjuntar archivo, respuestas predefinidas, nota interna, responder al cliente, enviar SMS al cliente y enviar correo electrónico al cliente. Adjuntar abre el selector de archivos del dispositivo. Respuestas predefinidas abre una hoja con plantillas de respuesta guardadas. Nota interna abre la hoja de notas con su selector de tipo.
**Correo electrónico.** La entrada de correo electrónico abre una hoja de composición con un campo de asunto y un editor de texto enriquecido. Un banner de advertencia de texto plano aparece sobre el editor porque el correo electrónico sale del sistema sin cifrar, a diferencia de los mensajes en la aplicación que permanecen sellados de extremo a extremo.
**Adjuntos.** Los archivos adjuntos a un ticket se cifran con la clave por ticket usando XChaCha20-Poly1305 y se almacenan como datos binarios cifrados, y el servidor nunca puede descifrar los adjuntos almacenados. Los voluntarios los descargan y descifran en el navegador.`)
};

/**
* | output |
* | --- |
* | "The + button at the bottom of the screen opens a popover listing the available compose actions. The entries that appear depend on the client's contact method..." |
*
* @param {Demo_Narrative_Topic_Compose_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_compose_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Compose_Actions_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Compose_Actions_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_compose_actions_body(inputs)
	return en_demo_narrative_topic_compose_actions_body(inputs)
});