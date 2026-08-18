/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Header_BodyInputs */

const en_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The header at the top of the ticket shows the title, current status, priority, assigned volunteer, and queue.
**Encryption by field.** Title and description are encrypted with the per ticket key. Queue name and assignee display name are encrypted with the organization key. Priority, status, and timestamps are plaintext metadata the server uses for sorting and filtering.
**Client phone.** The client phone number is role masked by the server. Administrators see the full number, managers and the assigned volunteer see the last four digits, and unassigned volunteers see nothing.
**Editing.** Volunteers can change the status, priority, assignee, and queue directly from the header. Changes are encrypted in the browser before being sent to the server.`)
};

const es_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El encabezado en la parte superior del ticket muestra el titulo, estado actual, prioridad, voluntario asignado y cola.
**Cifrado por campo.** El titulo y la descripcion estan cifrados con la clave por ticket. El nombre de la cola y el nombre del asignado estan cifrados con la clave de la organizacion. La prioridad, el estado y las marcas de tiempo son metadatos en texto plano que el servidor usa para ordenar y filtrar.
**Telefono del cliente.** El numero de telefono del cliente es enmascarado por el servidor segun el rol. Los administradores ven el numero completo, los gestores y el voluntario asignado ven los ultimos cuatro digitos, y los voluntarios no asignados no ven nada.
**Edicion.** Los voluntarios pueden cambiar el estado, prioridad, asignado y cola directamente desde el encabezado. Los cambios se cifran en el navegador antes de enviarse al servidor.`)
};

/**
* | output |
* | --- |
* | "The header at the top of the ticket shows the title, current status, priority, assigned volunteer, and queue. **Encryption by field.** Title and description ..." |
*
* @param {Demo_Narrative_Topic_Case_Header_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_header_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Header_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Header_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_case_header_body(inputs)
	return es_demo_narrative_topic_case_header_body(inputs)
});