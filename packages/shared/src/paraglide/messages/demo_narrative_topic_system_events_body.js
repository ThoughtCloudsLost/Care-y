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

const en_xa2_demo_narrative_topic_system_events_body = /** @type {(inputs: Demo_Narrative_Topic_System_Events_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgnmènts, stàtùs chàngès, prìòrìty chàngès, hòlds, ànd mèrgès àrè rècòrdèd ìn thè thrèàd às còmpàct èntrìès bètwèèn mèssàgès, sò thè càsè hìstòry ànd thè cònvèrsàtìòn stày ìn ònè plàcè. Cònsècùtìvè èvènts clùstèr ìntò à sìnglè èntry wìth à còùnt, whìch kèèps à bùrst òf càsè mànàgèmènt fròm bùryìng thè mèssàgès àròùnd ìt. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Assignments, status changes, priority changes, holds, and merges are recorded in the thread as compact entries between messages, so the case history and the ..." |
*
* @param {Demo_Narrative_Topic_System_Events_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_system_events_body = /** @type {((inputs?: Demo_Narrative_Topic_System_Events_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_System_Events_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_system_events_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_system_events_body(inputs)
	return en_demo_narrative_topic_system_events_body(inputs)
});