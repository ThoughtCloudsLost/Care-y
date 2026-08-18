/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_BodyInputs */

const en_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case details panel shows ticket metadata in a structured field list.
**Encrypted fields.** Title and description are encrypted with the per ticket key. Queue name and assignee display name are encrypted with the organization key. Client alias is encrypted with the per ticket key.
**Plaintext metadata.** Status, priority, on hold state, and timestamps are stored as plaintext so the server can sort and filter without decrypting.
**Client phone.** The phone number is role masked by the server. Administrators see the full number, managers and the assigned volunteer see the last four digits, and unassigned volunteers see nothing. The masking happens server side before the data reaches the browser.`)
};

const es_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel de detalles del caso muestra los metadatos del ticket en una lista de campos estructurada.
**Campos cifrados.** El titulo y la descripcion estan cifrados con la clave por ticket. El nombre de la cola y el nombre del asignado estan cifrados con la clave de la organizacion. El alias del cliente esta cifrado con la clave por ticket.
**Metadatos en texto plano.** El estado, la prioridad, el estado de espera y las marcas de tiempo se almacenan en texto plano para que el servidor pueda ordenar y filtrar sin descifrar.
**Telefono del cliente.** El numero de telefono es enmascarado por el servidor segun el rol. Los administradores ven el numero completo, los gestores y el voluntario asignado ven los ultimos cuatro digitos, y los voluntarios no asignados no ven nada. El enmascaramiento ocurre en el servidor antes de que los datos lleguen al navegador.`)
};

/**
* | output |
* | --- |
* | "The case details panel shows ticket metadata in a structured field list. **Encrypted fields.** Title and description are encrypted with the per ticket key. Q..." |
*
* @param {Demo_Narrative_Topic_Case_Fold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_fold_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Fold_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Fold_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_case_fold_body(inputs)
	return es_demo_narrative_topic_case_fold_body(inputs)
});