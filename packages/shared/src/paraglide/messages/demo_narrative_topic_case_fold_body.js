/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_BodyInputs */

const en_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case details fold shows ticket metadata: status, priority, assignee, queues, and client alias. Sensitive fields are encrypted. Expanding or collapsing the fold is a local UI action with no server call.`)
};

const es_demo_narrative_topic_case_fold_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El panel de detalles muestra metadatos del ticket: estado, prioridad, asignado, colas y alias del cliente. Los campos sensibles estan cifrados. Expandir o colapsar el panel es una accion de interfaz local sin llamada al servidor.`)
};

/**
* | output |
* | --- |
* | "The case details fold shows ticket metadata: status, priority, assignee, queues, and client alias. Sensitive fields are encrypted. Expanding or collapsing th..." |
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