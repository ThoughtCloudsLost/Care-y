/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Compose_Actions_BodyInputs */

const en_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The compose menu lists the available actions for a ticket. The entries that appear depend on the client's contact methods and the volunteer's permissions.
**Email.** The email compose sheet shows a plaintext warning banner because the message leaves the system unencrypted, unlike in-app messages that stay sealed end to end.
**Attachments.** Files attached to a ticket are encrypted with the per ticket key using XChaCha20-Poly1305 and stored as encrypted binary data. The server cannot decrypt stored attachments.`)
};

const es_demo_narrative_topic_compose_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Compose_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El menú de composición lista las acciones disponibles para un ticket. Las entradas que aparecen dependen de los métodos de contacto del cliente y los permisos del voluntario.
**Correo electrónico.** La hoja de composición de correo muestra un banner de advertencia de texto plano porque el mensaje sale del sistema sin cifrar, a diferencia de los mensajes en la aplicación que permanecen sellados de extremo a extremo.
**Adjuntos.** Los archivos adjuntos a un ticket se cifran con la clave por ticket usando XChaCha20-Poly1305 y se almacenan como datos binarios cifrados. El servidor no puede descifrar los adjuntos almacenados.`)
};

/**
* | output |
* | --- |
* | "The compose menu lists the available actions for a ticket. The entries that appear depend on the client's contact methods and the volunteer's permissions. **..." |
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