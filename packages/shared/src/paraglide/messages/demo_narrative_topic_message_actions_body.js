/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Actions_BodyInputs */

const en_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tapping and holding a message opens a context menu with actions for that specific message.
**Available actions.** Three actions are available: copy, edit, and delete. Edit and delete are restricted to internal notes authored by the current volunteer. Administrators can delete other volunteers' notes but cannot edit them.
**Copy.** Copies the decrypted message text to the clipboard. The copied text stays on the device.
**Client messages.** Messages from clients and volunteer replies support copy only. Edit and delete are not available for these message types.`)
};

const es_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mantener pulsado un mensaje abre un menu contextual con acciones para ese mensaje especifico.
**Acciones disponibles.** Tres acciones estan disponibles: copiar, editar y eliminar. Editar y eliminar estan restringidos a notas internas creadas por el voluntario actual. Los administradores pueden eliminar notas de otros voluntarios pero no pueden editarlas.
**Copiar.** Copia el texto descifrado del mensaje al portapapeles. El texto copiado permanece en el dispositivo.
**Mensajes del cliente.** Los mensajes de clientes y las respuestas de voluntarios solo admiten copiar. Editar y eliminar no estan disponibles para estos tipos de mensaje.`)
};

/**
* | output |
* | --- |
* | "Tapping and holding a message opens a context menu with actions for that specific message. **Available actions.** Three actions are available: copy, edit, an..." |
*
* @param {Demo_Narrative_Topic_Message_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Message_Actions_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Message_Actions_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_message_actions_body(inputs)
	return es_demo_narrative_topic_message_actions_body(inputs)
});