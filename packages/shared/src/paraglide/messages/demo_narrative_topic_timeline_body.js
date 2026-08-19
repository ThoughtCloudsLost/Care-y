/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Timeline_BodyInputs */

const en_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The detail view includes a toggle between the conversation thread and a timeline view. The timeline replaces the message thread with a structured chronological overview showing status changes, assignments, notes, and messages as a flat list.
**When to use it.** Timeline view is useful for reviewing the full history of a case, especially when the volunteer needs to see what actions were taken and when. The conversation view is better for reading and replying to messages.
**Encryption.** All entries in the timeline are decrypted locally, and the server stores them as opaque ciphertext.`)
};

const es_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La vista de detalle incluye un selector entre el hilo de conversacion y una vista de linea de tiempo. La linea de tiempo reemplaza el hilo de mensajes con un resumen cronologico estructurado que muestra cambios de estado, asignaciones, notas y mensajes como una lista plana.
**Cuando usarla.** La vista de linea de tiempo es util para revisar el historial completo de un caso, especialmente cuando el voluntario necesita ver que acciones se tomaron y cuando. La vista de conversacion es mejor para leer y responder mensajes.
**Cifrado.** Todas las entradas de la linea de tiempo se descifran localmente, y el servidor las almacena como texto cifrado opaco.`)
};

/**
* | output |
* | --- |
* | "The detail view includes a toggle between the conversation thread and a timeline view. The timeline replaces the message thread with a structured chronologic..." |
*
* @param {Demo_Narrative_Topic_Timeline_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_timeline_body = /** @type {((inputs?: Demo_Narrative_Topic_Timeline_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Timeline_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_timeline_body(inputs)
	return es_demo_narrative_topic_timeline_body(inputs)
});