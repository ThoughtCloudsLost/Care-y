/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Outbound_Edit_BodyInputs */

const en_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can edit an outbound in-app message after sending it by opening the message's action menu and selecting edit. The edit sheet opens with the decrypted content prefilled.
**Character counter.** A character limit applies to edited messages. A counter appears near the cap and turns red when the limit is reached.
**Re-encryption.** Saving an edit re-encrypts the message in the browser using the same ticket key. When a portal channel is active, the update is also encrypted to the client's public key so the corrected version is readable on the client side.
**Scope.** Only in-app outbound messages authored by the current volunteer can be edited. SMS messages, client messages, and internal notes are not editable from this sheet.`)
};

const es_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden editar un mensaje saliente en la aplicación después de enviarlo abriendo el menú de acciones del mensaje y seleccionando editar. La hoja de edición se abre con el contenido descifrado prellenado.
**Contador de caracteres.** Se aplica un límite de caracteres a los mensajes editados. Un contador aparece cerca del máximo y se pone rojo cuando se alcanza el límite.
**Re-cifrado.** Guardar una edición re-cifra el mensaje en el navegador usando la misma clave del ticket. Cuando hay un canal del portal activo, la actualización también se cifra con la clave pública del cliente para que la versión corregida sea legible del lado del cliente.
**Alcance.** Solo los mensajes salientes en la aplicación escritos por el voluntario actual pueden editarse. Los mensajes SMS, mensajes de clientes y notas internas no son editables desde esta hoja.`)
};

/**
* | output |
* | --- |
* | "Volunteers can edit an outbound in-app message after sending it by opening the message's action menu and selecting edit. The edit sheet opens with the decryp..." |
*
* @param {Demo_Narrative_Topic_Outbound_Edit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_outbound_edit_body = /** @type {((inputs?: Demo_Narrative_Topic_Outbound_Edit_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Outbound_Edit_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_outbound_edit_body(inputs)
	return en_demo_narrative_topic_outbound_edit_body(inputs)
});