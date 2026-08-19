/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_BodyInputs */

const en_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The disclosure handle under the ticket header folds the case fields away to give the conversation more room and brings them back when needed.
**What folds.** The description, the queue and assignee, and the opened date collapse behind the handle. The title, status, and priority stay visible in the header above it.
**Encryption.** The description is encrypted with the per ticket key, and the queue and assignee names with the organization key. The opened date is plaintext metadata the server uses for sorting.
**The full record.** The complete field list, along with the role masked client phone number and the case actions, lives in the case panel described later in this section.`)
};

const es_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El asa de apertura debajo del encabezado del ticket pliega los campos del caso para dar mas espacio a la conversacion y los muestra de nuevo cuando se necesitan.
**Que se pliega.** La descripcion, la cola y el asignado, y la fecha de apertura se colapsan detras del asa. El titulo, el estado y la prioridad permanecen visibles en el encabezado de arriba.
**Cifrado.** La descripcion esta cifrada con la clave por ticket, y los nombres de la cola y del asignado con la clave de la organizacion. La fecha de apertura es un metadato en texto plano que el servidor usa para ordenar.
**El registro completo.** La lista completa de campos, junto con el numero de telefono del cliente enmascarado por rol y las acciones del caso, vive en el panel del caso descrito mas adelante en esta seccion.`)
};

/**
* | output |
* | --- |
* | "The disclosure handle under the ticket header folds the case fields away to give the conversation more room and brings them back when needed. **What folds.**..." |
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