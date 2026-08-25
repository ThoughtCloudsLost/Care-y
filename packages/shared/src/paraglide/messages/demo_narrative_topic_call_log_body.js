/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Call_Log_BodyInputs */

const en_demo_narrative_topic_call_log_body = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Every call attempt between a volunteer and a client is logged in the thread with its outcome so the history of reaching a client stays visible inside the case record. Completed calls show the direction and duration while unanswered attempts are recorded separately, and the entries sit inline between the messages so a volunteer returning to the ticket can read the full communication history in order.`)
};

const es_demo_narrative_topic_call_log_body = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada intento de llamada entre un voluntario y un cliente se registra en el hilo con su resultado para que el historial de contacto con un cliente quede visible dentro del registro del caso. Las llamadas completadas muestran la dirección y la duración mientras que los intentos sin respuesta se registran por separado, y las entradas aparecen en línea entre los mensajes para que un voluntario que regrese al ticket pueda leer el historial completo de comunicación en orden.`)
};

/**
* | output |
* | --- |
* | "Every call attempt between a volunteer and a client is logged in the thread with its outcome so the history of reaching a client stays visible inside the cas..." |
*
* @param {Demo_Narrative_Topic_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_call_log_body = /** @type {((inputs?: Demo_Narrative_Topic_Call_Log_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Call_Log_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_call_log_body(inputs)
	return es_demo_narrative_topic_call_log_body(inputs)
});