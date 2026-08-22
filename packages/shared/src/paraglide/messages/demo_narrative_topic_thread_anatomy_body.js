/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Anatomy_BodyInputs */

const en_demo_narrative_topic_thread_anatomy_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Anatomy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The thread carries more than message bubbles between clients and volunteers.
**Date separators.** These mark where one date between follow ups.
**Unread divider.** A line marks the first message the volunteer has not read yet, so returning to a busy ticket starts reading at the right place.
**System events.** Assignments, status changes, priority changes, holds, and merges appear as compact entries between messages, and consecutive events cluster together so a burst of case management does not bury the conversation.
**Older messages.** Long conversations load in pages. Scrolling up fetches and decrypts the next page, and a gap indicator shows when part of the history has not been loaded yet.`)
};

const es_demo_narrative_topic_thread_anatomy_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Anatomy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El hilo contiene más que burbujas de mensaje entre clientes y voluntarios.
**Separadores de fecha.** Estos marcan donde cambia la fecha entre seguimientos.
**Divisor de no leídos.** Una línea marca el primer mensaje que el voluntario aún no ha leído, para que al volver a un ticket ocupado la lectura comience en el lugar correcto.
**Eventos del sistema.** Asignaciones, cambios de estado, cambios de prioridad, esperas y fusiones aparecen como entradas compactas entre mensajes, y los eventos consecutivos se agrupan para que una ráfaga de gestión del caso no entierre la conversación.
**Mensajes anteriores.** Las conversaciones largas se cargan por páginas. Al desplazarse hacia arriba se obtiene y descifra la página siguiente, y un indicador de hueco muestra cuando parte del historial aún no se ha cargado.`)
};

/**
* | output |
* | --- |
* | "The thread carries more than message bubbles between clients and volunteers. **Date separators.** These mark where one date between follow ups. **Unread divi..." |
*
* @param {Demo_Narrative_Topic_Thread_Anatomy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_anatomy_body = /** @type {((inputs?: Demo_Narrative_Topic_Thread_Anatomy_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Thread_Anatomy_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_thread_anatomy_body(inputs)
	return es_demo_narrative_topic_thread_anatomy_body(inputs)
});