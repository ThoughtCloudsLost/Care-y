/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_On_Hold_BodyInputs */

const en_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A hold sets a ticket aside while an answer is waited on, leaving it open and out of the working list until the hold is lifted. Every hold in the user's queues appears here, not only the ones the user placed. [[#client-data]]
**Where the heading number comes from.** The server count includes every ticket carrying the hold flag in those queues, closed ones as well, while the rows come from the loaded page of open tickets. A hold on a ticket that was later closed is inside the count and absent from the rows. [[#metadata #failure-states]]
**What the hold flag is.** A plaintext boolean on the ticket row, set and cleared from the ticket itself or from the row's own actions. A database dump shows how many tickets an organization has parked and which queues they are in, and nothing about why any of them is waiting, since the reason lives in the encrypted thread. Clearing the flag returns the ticket to whichever section its assignment puts it in. [[#server-holds #metadata]]
**The flag and the update path.** \`on_hold\` comes from \`024_create_tickets.ts\` with a false default. The mutation is \`tickets.update\` with an \`onHold\` field, driven from the overview by \`createHoldAction\` in \`packages/client/src/lib/composables/ticket-list/create-hold-action.svelte.ts\`, the same composable the tickets list uses. The hold arm of the counts query tests the flag alone and applies no status condition. [[#client-data]]`)
};

const es_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una espera aparta un ticket mientras se aguarda una respuesta y lo deja abierto y fuera de la lista de trabajo hasta que se levanta. Aquí aparecen todas las esperas de las colas de la persona usuaria, no solo las que ella puso. [[#client-data]]
**De dónde sale el número del encabezado.** El recuento del servidor incluye todos los tickets con la marca de espera en esas colas, también los cerrados, mientras que las filas salen de la página cargada de tickets abiertos. Una espera sobre un ticket que después se cerró está dentro del recuento y no figura entre las filas. [[#metadata #failure-states]]
**Qué es la marca de espera.** Un booleano en texto plano en la fila del ticket, que se pone y se quita desde el propio ticket o desde las acciones de la fila. Un volcado de la base de datos muestra cuántos tickets tiene aparcados una organización y en qué colas están, y nada sobre por qué espera cada uno, porque el motivo vive en el hilo cifrado. Quitar la marca devuelve el ticket a la sección que le corresponda según su asignación. [[#server-holds #metadata]]
**La marca y la ruta de actualización.** \`on_hold\` viene de \`024_create_tickets.ts\` con un valor por defecto de falso. La mutación es \`tickets.update\` con un campo \`onHold\`, accionada desde el resumen por \`createHoldAction\`, en \`packages/client/src/lib/composables/ticket-list/create-hold-action.svelte.ts\`, la misma utilidad que usa la lista de tickets. La rama de espera de la consulta de recuentos comprueba solo la marca y no aplica ninguna condición de estado. [[#client-data]]`)
};

const en_xa2_demo_narrative_dashboard_on_hold_body = /** @type {(inputs: Demo_Narrative_Dashboard_On_Hold_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèts thè cùrrènt vòlùntèèr hàs plàcèd òn hòld. Thèsè àrè stìll òpèn bùt sèt àsìdè, typìcàlly whìlè wàìtìng fòr à rèspònsè fròm à clìènt òr àn èxtèrnàl pàrty.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Rèsùmìng. •••** Chàngìng à tìckèt's stàtùs bàck tò àctìvè fròm thè tìckèt dètàìl vìèw rètùrns ìt tò thè màìn wòrkìng lìst.
 •••••••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thìs sèctìòn ònly àppèàrs whèn àt lèàst ònè tìckèt ìs òn hòld. Òthèrwìsè ìt ìs hìddèn. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A hold sets a ticket aside while an answer is waited on, leaving it open and out of the working list until the hold is lifted. Every hold in the user's queue..." |
*
* @param {Demo_Narrative_Dashboard_On_Hold_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_on_hold_body = /** @type {((inputs?: Demo_Narrative_Dashboard_On_Hold_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_On_Hold_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_on_hold_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_on_hold_body(inputs)
	return en_demo_narrative_dashboard_on_hold_body(inputs)
});