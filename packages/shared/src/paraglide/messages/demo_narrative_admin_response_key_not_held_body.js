/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs */

const en_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An unreadable response row shows what a user sees when an intake response was encrypted under a key they do not hold. The card displays the submission date, but the field values stay encrypted.
**Why it happens.** When the first user opens a ticket created from an intake form, the system distributes the decryption key to every active user who has a published key and belongs to either the destination queue or holds the intake response viewing permission. A user outside that set at conversion time cannot decrypt the response fields because they never received a copy of the key.
**Same pattern as tickets.** When a user does not hold a ticket's content key, its title shows as ciphertext rather than hiding the ticket entirely, and the same deliberate choice applies to intake responses.`)
};

const es_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una fila de respuesta ilegible muestra lo que ve un usuario cuando una respuesta de admisión fue cifrada con una clave que no posee. La tarjeta muestra la fecha de envío, pero los valores de los campos permanecen cifrados.
**Por qué sucede.** Cuando el primer usuario abre un ticket creado a partir de un formulario de admisión, el sistema distribuye la clave de descifrado a todos los usuarios activos que tienen una clave publicada y pertenecen a la cola de destino o poseen el permiso de visualización de respuestas de admisión. Un usuario fuera de ese conjunto en el momento de la conversión no puede descifrar los campos de la respuesta porque nunca recibió una copia de la clave.
**Mismo patrón que los tickets.** Cuando un usuario no posee la clave de contenido de un ticket, su título aparece como texto cifrado en lugar de ocultar el ticket por completo, y la misma decisión deliberada se aplica a las respuestas de admisión.`)
};

/**
* | output |
* | --- |
* | "An unreadable response row shows what a user sees when an intake response was encrypted under a key they do not hold. The card displays the submission date, ..." |
*
* @param {Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_key_not_held_body = /** @type {((inputs?: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_response_key_not_held_body(inputs)
	return en_demo_narrative_admin_response_key_not_held_body(inputs)
});