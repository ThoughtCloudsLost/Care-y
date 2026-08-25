/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_System_Events_BodyInputs */

const en_demo_narrative_topic_system_events_body = /** @type {(inputs: Demo_Narrative_Topic_System_Events_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assignments, status changes, priority changes, holds, and merges are recorded in the thread as compact entries between messages, so the case history and the conversation stay in one place. Consecutive events cluster into a single entry with a count, which keeps a burst of case management from burying the messages around it.`)
};

const es_demo_narrative_topic_system_events_body = /** @type {(inputs: Demo_Narrative_Topic_System_Events_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las asignaciones, los cambios de estado, los cambios de prioridad, las esperas y las fusiones se registran en el hilo como entradas compactas entre los mensajes, así el historial del caso y la conversación permanecen en un solo lugar. Los eventos consecutivos se agrupan en una sola entrada con un contador, lo que evita que una ráfaga de gestión del caso entierre los mensajes a su alrededor.`)
};

/**
* | output |
* | --- |
* | "Assignments, status changes, priority changes, holds, and merges are recorded in the thread as compact entries between messages, so the case history and the ..." |
*
* @param {Demo_Narrative_Topic_System_Events_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_system_events_body = /** @type {((inputs?: Demo_Narrative_Topic_System_Events_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_System_Events_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_system_events_body(inputs)
	return es_demo_narrative_topic_system_events_body(inputs)
});