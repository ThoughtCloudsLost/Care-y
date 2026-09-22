/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Quick_Actions_BodyInputs */

const en_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A row carries the common operations on a ticket so they finish without opening it. [[#client-data]]
**What a swipe offers in each direction.** Pulling a row to the right offers a reply first and a call past it; pulling it to the left offers assignment first and a hold past it. A short pull holds the tray open for a deliberate tap, a longer one runs the action on release, and only one row holds its tray at a time. A long press picks the row for a bulk action instead. [Bulk selection](#tickets/select-mode) covers that path. [[#client-data]]
**The same actions in cards.** Cards carry reply, call, hold or release from hold, and either take when nobody is assigned or assign when someone is, so the two most common outcomes for an unclaimed ticket are one tap apart. [[#client-data]]
**What each one writes and what it needs.** Holding writes the hold flag and assigning or taking writes the assignee, all plaintext columns on the ticket row, and the server checks permission to change case status for the first, to assign cases for the second and to claim cases for taking one, and refuses any ticket outside the account's queues. Each of the three writes a system event into the ticket's timeline, so a hold or a hand-off is part of the record a teammate reads. A reply opens the composer the ticket's own page uses, which seals the message in the browser before it is sent. [Replying](#ticket-detail/reply) covers what a reply carries. [[#permissions #encryption]]
**The gesture layer and the flows.** \`SwipeableCard.svelte\` in \`packages/client/src/lib/components/tickets/\` owns the thresholds and the single-tray rule, and each action is a composable in \`packages/client/src/lib/composables/ticket-list/\`, the same ones the overview's rows call, so the two surfaces cannot drift apart. [My tickets](#dashboard/my-tickets) covers those rows. [[#client-data]]`)
};

const es_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una fila lleva las operaciones habituales sobre un ticket para que se completen sin abrirlo. [[#client-data]]
**Qué ofrece cada dirección del deslizamiento.** Arrastrar una fila hacia la derecha ofrece primero responder y, más allá, llamar; arrastrarla hacia la izquierda ofrece primero asignar y, más allá, poner en espera. Un arrastre corto mantiene la bandeja abierta para pulsar con intención, uno más largo ejecuta la acción al soltar, y solo una fila mantiene su bandeja abierta a la vez. Una pulsación larga escoge la fila para una acción masiva. [Selección masiva](#tickets/select-mode) trata esa vía. [[#client-data]]
**Las mismas acciones en las tarjetas.** Las tarjetas llevan responder, llamar, poner o quitar la espera, y tomar cuando no hay nadie asignado o asignar cuando sí lo hay, de modo que los dos desenlaces más habituales de un ticket sin dueño están a una pulsación de distancia. [[#client-data]]
**Qué escribe cada una y qué necesita.** Poner en espera escribe la marca de espera, y asignar o tomar escriben la persona asignada, todas columnas en texto plano de la fila del ticket, y el servidor comprueba el permiso de cambiar el estado de un caso para la primera, el de asignar casos para la segunda y el de reclamar casos para tomar uno, y rechaza cualquier ticket fuera de las colas de la cuenta. Cada una de las tres escribe un evento de sistema en la línea de tiempo del ticket, de modo que una espera o un traspaso forman parte del registro que lee el resto del equipo. Responder abre el redactor que usa la propia página del ticket, que sella el mensaje en el navegador antes de enviarlo. [Responder](#ticket-detail/reply) trata lo que lleva una respuesta. [[#permissions #encryption]]
**La capa de gestos y los flujos.** \`SwipeableCard.svelte\`, en \`packages/client/src/lib/components/tickets/\`, gobierna los umbrales y la regla de una sola bandeja, y cada acción es una utilidad de \`packages/client/src/lib/composables/ticket-list/\`, las mismas que llaman las filas del resumen, de modo que las dos superficies no pueden separarse. [Mis tickets](#dashboard/my-tickets) trata esas filas. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_quick_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Quick_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmmòn òpèràtìòns òn à tìckèt wìthòùt òpènìng ìt, àccèssèd by swìpìng à tìckèt ròw.
 ••••••••••••••••••••••••••**Swìpè dìrèctìòns. ••••••** Swìpè rìght tò rèply. Swìpè lèft tò àssìgn òr plàcè à tìckèt òn hòld. À shòrt swìpè pèèks thè àctìòn trày, ànd à lòngèr swìpè fìrès thè àctìòn dìrèctly.
 •••••••••••••••••••••••••••••••••••••••••••••••**Àvàìlàblè àctìòns. ••••••** Rèply, àssìgn, ànd hòld. Thè spècìfìc àctìòns shòwn dèpènd òn thè tìckèt's cùrrènt stàtè ànd thè vòlùntèèr's pèrmìssìòns.
 •••••••••••••••••••••••••••••••••••••**Càrds vìèw. ••••** Ìn càrds vìèw thè sàmè àctìòns àlsò àppèàr às à vìsìblè bùttòn ròw òn èàch càrd, sò nò swìpè ìs nèèdèd tò rèàch thèm.
 ••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Àctìòns thàt mòdìfy tìckèt dàtà èncrypt thè chàngès ìn thè bròwsèr bèfòrè sèndìng thèm tò thè sèrvèr. •••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A row carries the common operations on a ticket so they finish without opening it. [[#client-data]] **What a swipe offers in each direction.** Pulling a row ..." |
*
* @param {Demo_Narrative_Topic_Quick_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_quick_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Quick_Actions_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Quick_Actions_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_quick_actions_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_quick_actions_body(inputs)
	return en_demo_narrative_topic_quick_actions_body(inputs)
});