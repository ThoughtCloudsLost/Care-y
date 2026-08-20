/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Close_Reopen_BodyInputs */

const en_demo_narrative_topic_close_reopen_body = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can close a ticket when the case is resolved.
**Resolution notes.** When closing, the system checks which note types are marked as required on close. If any are, the volunteer is stepped through them one at a time. Each step can be skipped. If no note types require notes required at close, the ticket closes immediately with no prompt. Resolution notes are encrypted with the per ticket key before storage.
**Reopening.** A closed ticket can be reopened if the case needs further attention. Reopening restores the ticket to active status and it reappears in the volunteer's working lists.`)
};

const es_demo_narrative_topic_close_reopen_body = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden cerrar un ticket cuando el caso está resuelto.
**Notas de resolución.** Al cerrar, el sistema verifica qué tipos de nota están marcados como requeridos al cierre. Si hay alguno, el voluntario los recorre uno a uno. Cada paso se puede omitir. Si ningún tipo de nota requiere notas al cierre, el ticket se cierra inmediatamente sin solicitud. Las notas de resolución se cifran con la clave por ticket antes de almacenarse.
**Reabrir.** Un ticket cerrado se puede reabrir si el caso necesita más atención. Reabrir restaura el ticket a estado activo y reaparece en las listas de trabajo del voluntario.`)
};

/**
* | output |
* | --- |
* | "Volunteers can close a ticket when the case is resolved. **Resolution notes.** When closing, the system checks which note types are marked as required on clo..." |
*
* @param {Demo_Narrative_Topic_Close_Reopen_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_close_reopen_body = /** @type {((inputs?: Demo_Narrative_Topic_Close_Reopen_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Close_Reopen_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_close_reopen_body(inputs)
	return es_demo_narrative_topic_close_reopen_body(inputs)
});