/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_BodyInputs */

const en_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Inside a ticket, filter by message type, author, or date. Thread filters narrow the visible timeline without a new server request. All messages are already decrypted locally.`)
};

const es_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Dentro de un ticket, filtra por tipo de mensaje, autor o fecha. Los filtros de conversacion reducen la linea de tiempo visible sin una nueva solicitud al servidor. Todos los mensajes ya estan descifrados localmente.`)
};

/**
* | output |
* | --- |
* | "Inside a ticket, filter by message type, author, or date. Thread filters narrow the visible timeline without a new server request. All messages are already d..." |
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