/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_System_Events_BodyInputs */

const en_demo_narrative_topic_system_events_body = /** @type {(inputs: Demo_Narrative_Topic_System_Events_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Assignments, status changes, priority and queue moves, holds and merges are recorded in the thread as their own entries, so what was done to a case sits in the same sequence as what was said on it. [[#client-data]]
**Why these entries carry no ciphertext.** The server writes them, and the server holds no key it could seal them with, so the entry is a type and a few parameters in plaintext and an empty content column. A database dump therefore shows that an account was assigned a case on a given morning, that its priority went from normal to urgent an hour later, and which queue it moved to, while the words of the case stay closed. [The trust boundary](#deep-dive/the-trust-boundary) lists the rest of what a dump reaches. [[#server-holds #metadata #encryption]]
**Where the names come from.** The parameters name accounts and queues by identifier, and the browser resolves them against organization-key ciphertext it already holds, so the readable sentence exists only where those names can be opened. An identifier the browser cannot resolve reads as an unnamed account or queue rather than as a failure. [[#failure-states #client-data]]
**Runs of the same event.** Consecutive entries of one type within ten minutes of each other are shown as a single line with a count, which applies only to types that carry no parameters of their own, because a priority change from one value to another cannot be summed with the next one. [[#client-data]]
**What writes one.** Each of these entries is written by the operation it records rather than by the component that draws it, so an assignment made from the case list, from the panel or by an automatic rule produces the same entry. Who may perform each operation is a separate permission. [The permission system](#deep-dive/the-permission-system) covers those grants. [[#permissions]]
**The label map and the columns.** \`packages/client/src/lib/tickets/system-event-label.ts\` maps each type to its sentence, \`SystemEvent.svelte\` draws it, and the parameters live in the \`event_params\` column from \`080_add_followup_event_params.ts\`. The writes are in \`packages/server/src/tickets/ticket-service.ts\`, with the shared reopen path in \`ticket-reopen.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_system_events_body = /** @type {(inputs: Demo_Narrative_Topic_System_Events_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las asignaciones, los cambios de estado, los cambios de prioridad y de cola, las esperas y las fusiones quedan registrados en el hilo como entradas propias, de modo que lo que se hizo con un caso está en la misma secuencia que lo que se dijo en él. [[#client-data]]
**Por qué estas entradas no llevan texto cifrado.** Las escribe el servidor, y el servidor no tiene ninguna clave con la que sellarlas, así que la entrada es un tipo y unos pocos parámetros en texto plano con la columna de contenido vacía. Un volcado de la base de datos muestra por tanto que a una cuenta se le asignó un caso cierta mañana, que su prioridad pasó de normal a urgente una hora después y a qué cola se movió, mientras las palabras del caso siguen cerradas. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera lo demás que alcanza un volcado. [[#server-holds #metadata #encryption]]
**De dónde salen los nombres.** Los parámetros nombran cuentas y colas por identificador, y el navegador los resuelve contra texto cifrado con la clave de la organización que ya tiene, de modo que la frase legible existe solo donde esos nombres se pueden abrir. Un identificador que el navegador no puede resolver se lee como una cuenta o una cola sin nombre y no como un fallo. [[#failure-states #client-data]]
**Rachas del mismo evento.** Las entradas consecutivas de un mismo tipo separadas por menos de diez minutos se muestran como una sola línea con un recuento, algo que solo se aplica a los tipos que no llevan parámetros propios, porque un cambio de prioridad de un valor a otro no se puede sumar con el siguiente. [[#client-data]]
**Qué escribe una de estas entradas.** Cada una la escribe la operación que registra y no el componente que la dibuja, así que una asignación hecha desde la lista de casos, desde el panel o por una regla automática produce la misma entrada. Quién puede realizar cada operación es un permiso aparte. [El sistema de permisos](#deep-dive/the-permission-system) trata esas concesiones. [[#permissions]]
**El mapa de etiquetas y las columnas.** \`packages/client/src/lib/tickets/system-event-label.ts\` asigna a cada tipo su frase, \`SystemEvent.svelte\` la dibuja, y los parámetros viven en la columna \`event_params\` de \`080_add_followup_event_params.ts\`. Las escrituras están en \`packages/server/src/tickets/ticket-service.ts\`, con el camino de reapertura compartido en \`ticket-reopen.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_system_events_body = /** @type {(inputs: Demo_Narrative_Topic_System_Events_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àssìgnmènts, stàtùs chàngès, prìòrìty chàngès, hòlds, ànd mèrgès àrè rècòrdèd ìn thè thrèàd às còmpàct èntrìès bètwèèn mèssàgès, sò thè càsè hìstòry ànd thè cònvèrsàtìòn stày ìn ònè plàcè. Cònsècùtìvè èvènts clùstèr ìntò à sìnglè èntry wìth à còùnt, whìch kèèps à bùrst òf càsè mànàgèmènt fròm bùryìng thè mèssàgès àròùnd ìt. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Assignments, status changes, priority and queue moves, holds and merges are recorded in the thread as their own entries, so what was done to a case sits in t..." |
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