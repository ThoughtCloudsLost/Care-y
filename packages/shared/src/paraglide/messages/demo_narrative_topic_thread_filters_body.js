/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_BodyInputs */

const en_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inside a ticket, filter the thread by message type, author, or date. Thread filters narrow the visible messages without a new server request because all messages are already decrypted locally.
**Message types.** Filter to show only client messages, volunteer replies, internal notes, status changes, or assignments. This is useful in long threads where the volunteer needs to find a specific type of entry.
**Author filter.** In tickets with multiple volunteers, filter to show messages from a specific person.`)
};

const es_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dentro de un ticket, filtra el hilo por tipo de mensaje, autor o fecha. Los filtros de conversación reducen los mensajes visibles sin una nueva solicitud al servidor porque todos los mensajes ya están descifrados localmente.
**Tipos de mensaje.** Filtra para mostrar solo mensajes del cliente, respuestas de voluntarios, notas internas, cambios de estado o asignaciones. Esto es útil en hilos largos donde el voluntario necesita encontrar un tipo específico de entrada.
**Filtro por autor.** En tickets con varios voluntarios, filtra para mostrar mensajes de una persona específica.`)
};

/**
* | output |
* | --- |
* | "Inside a ticket, filter the thread by message type, author, or date. Thread filters narrow the visible messages without a new server request because all mess..." |
*
* @param {Demo_Narrative_Topic_Thread_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Thread_Filters_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Thread_Filters_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_thread_filters_body(inputs)
	return es_demo_narrative_topic_thread_filters_body(inputs)
});