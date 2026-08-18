/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_New_Ticket_BodyInputs */

const en_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a volunteer creates a ticket, the title and description are encrypted in the browser before they leave the device. The server stores the ciphertext and assigns a ticket ID without reading the content.
**Required fields.** A new ticket needs a title and a queue assignment at minimum. Description, priority, and initial assignee are optional.
**Permissions.** All volunteers can create tickets. Queue assignment is limited to queues the volunteer has access to.`)
};

const es_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un voluntario crea un ticket, el titulo y la descripcion se cifran en el navegador antes de salir del dispositivo. El servidor almacena el texto cifrado y asigna un ID de ticket sin leer el contenido.
**Campos requeridos.** Un nuevo ticket necesita un titulo y una asignacion de cola como minimo. La descripcion, prioridad y asignado inicial son opcionales.
**Permisos.** Todos los voluntarios pueden crear tickets. La asignacion de cola se limita a las colas a las que el voluntario tiene acceso.`)
};

/**
* | output |
* | --- |
* | "When a volunteer creates a ticket, the title and description are encrypted in the browser before they leave the device. The server stores the ciphertext and ..." |
*
* @param {Demo_Narrative_Topic_New_Ticket_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_body = /** @type {((inputs?: Demo_Narrative_Topic_New_Ticket_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_New_Ticket_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_new_ticket_body(inputs)
	return es_demo_narrative_topic_new_ticket_body(inputs)
});