/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Select_Mode_BodyInputs */

const en_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select mode turns the list into a pick-several surface so one action applies to every ticket chosen, and a long press on a row both enters the mode and picks that row. [[#client-data]]
**The four actions and what they write.** Assigning records an account against each ticket, holding sets the hold flag, and the other two change the priority or move the ticket to another queue. All four write plaintext columns on the ticket row, so the content stays sealed and a database dump gains a set of tickets that changed the same way at the same moment. Each one also writes a system event into that ticket's own timeline, and a priority or queue change that would leave the value as it was writes nothing at all. [The trust boundary](#deep-dive/the-trust-boundary) sets out those columns. [[#server-holds #metadata]]
**One request per ticket.** A bulk action is a sequence of single-ticket mutations rather than one wide write. The run stops at the first refusal and reports how many succeeded, which leaves the earlier tickets changed and the rest untouched, and the selection is cleared either way. Running the same action again over the remainder is what finishes the job. [[#failure-states]]
**What the server checks on each one.** Assigning needs permission to assign cases, and holding, repriotizing and moving between queues need permission to change case status. Every account is offered all four, and the server refuses the ones the account does not hold, ticket by ticket, along with any ticket outside the queues it has access to. [The permission system](#deep-dive/the-permission-system) covers where those permissions come from. [[#permissions]]
**The selection state and the batch runner.** The mode is \`createMultiSelect\` in \`packages/client/src/lib/composables/ticket-list/create-multi-select.svelte.ts\`, which holds the chosen ids and nothing else, and the sequencing is \`batchMutate\` in \`packages/client/src/lib/composables/ticket-list/create-bulk-actions.svelte.ts\`. Both are the tickets list's alone; the overview's rows carry the single-ticket actions instead. [Quick actions](#tickets/quick-actions) covers those. [[#client-data]]`)
};

const es_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El modo de selección convierte la lista en una superficie de elegir varios para que una acción se aplique a todos los tickets escogidos, y una pulsación larga sobre una fila entra en el modo y escoge esa fila. [[#client-data]]
**Las cuatro acciones y lo que escriben.** Asignar registra una cuenta en cada ticket, poner en espera activa la marca de espera, y las otras dos cambian la prioridad o trasladan el ticket a otra cola. Las cuatro escriben columnas en texto plano de la fila del ticket, así que el contenido sigue sellado y un volcado de la base de datos gana un conjunto de tickets que cambiaron igual en el mismo momento. Cada una escribe además un evento de sistema en la línea de tiempo de ese ticket, y un cambio de prioridad o de cola que dejaría el valor como estaba no escribe nada. [La frontera de confianza](#deep-dive/the-trust-boundary) expone esas columnas. [[#server-holds #metadata]]
**Una petición por ticket.** Una acción masiva es una secuencia de mutaciones de un solo ticket y no una escritura ancha. La ejecución se detiene ante el primer rechazo e informa de cuántas salieron bien, lo que deja cambiados los tickets anteriores e intactos los demás, y la selección se vacía en ambos casos. Repetir la misma acción sobre lo que queda es lo que termina el trabajo. [[#failure-states]]
**Qué comprueba el servidor en cada una.** Asignar necesita permiso para asignar casos, y poner en espera, cambiar la prioridad y mover entre colas necesitan permiso para cambiar el estado de un caso. A todas las cuentas se les ofrecen las cuatro, y el servidor rechaza las que la cuenta no tiene, ticket a ticket, junto con cualquier ticket fuera de las colas a las que tiene acceso. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen esos permisos. [[#permissions]]
**El estado de selección y el ejecutor por lotes.** El modo es \`createMultiSelect\`, en \`packages/client/src/lib/composables/ticket-list/create-multi-select.svelte.ts\`, que guarda los identificadores escogidos y nada más, y la secuenciación es \`batchMutate\`, en \`packages/client/src/lib/composables/ticket-list/create-bulk-actions.svelte.ts\`. Ambos son propios de la lista de tickets; las filas del resumen llevan en su lugar las acciones de un solo ticket. [Acciones rápidas](#tickets/quick-actions) las trata. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_select_mode_body = /** @type {(inputs: Demo_Narrative_Topic_Select_Mode_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct mòdè àllòws pìckìng mùltìplè tìckèts fòr bàtch àctìòns.
 •••••••••••••••••••**Àvàìlàblè àctìòns. ••••••** Thè bùlk àctìòn bàr àppèàrs àbòvè thè tìckèt lìst wìth òptìòns thàt àpply tò àll sèlèctèd tìckèts. Àctìòns dèpènd òn thè vòlùntèèr's pèrmìssìòns. ••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Select mode turns the list into a pick-several surface so one action applies to every ticket chosen, and a long press on a row both enters the mode and picks..." |
*
* @param {Demo_Narrative_Topic_Select_Mode_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_select_mode_body = /** @type {((inputs?: Demo_Narrative_Topic_Select_Mode_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Select_Mode_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_select_mode_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_select_mode_body(inputs)
	return en_demo_narrative_topic_select_mode_body(inputs)
});