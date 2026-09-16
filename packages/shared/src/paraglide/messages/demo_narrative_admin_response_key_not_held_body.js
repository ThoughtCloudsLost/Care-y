/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs */

const en_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a response was encrypted under a key the user does not hold, the response row shows the submission time but not the field values, so the user can see that a response exists without being able to read it.
**How it works.** When the first user opens a ticket created from an intake form, the system distributes the decryption key to every active user who has a published key and belongs to either the destination queue or holds the View intake responses permission. A user outside that set at conversion time has no copy of the key and cannot decrypt the response fields.
**If it fails.** A separate state appears when key material exists for the user but decryption did not succeed, and there may be nothing the user can do about either state. Each carries its own glyph and explanation so the user can tell which situation applies.`)
};

const es_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando una respuesta fue cifrada con una clave que la persona usuaria no posee, la fila de respuesta muestra la fecha de envío pero no los valores de los campos, de modo que se puede ver que existe una respuesta sin poder leerla.
**Cómo funciona.** Cuando la primera persona abre un ticket creado a partir de un formulario de admisión, el sistema distribuye la clave de descifrado a todas las personas activas que tienen una clave publicada y pertenecen a la cola de destino o poseen el permiso Leer respuestas de ingreso de todas las colas. Una persona fuera de ese conjunto en el momento de la conversión no tiene copia de la clave y no puede descifrar los campos de la respuesta.
**Si falla.** Un estado distinto aparece cuando existe material de clave para la persona usuaria pero el descifrado no tuvo éxito, y puede que no haya nada que hacer ante ninguno de los dos estados. Cada uno lleva su propio glifo y explicación para que la persona usuaria pueda distinguir cuál aplica.`)
};

/**
* | output |
* | --- |
* | "When a response was encrypted under a key the user does not hold, the response row shows the submission time but not the field values, so the user can see th..." |
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