/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_List_Stats_BodyInputs */

const en_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The counts report how many tickets are new, active and on hold across every queue the user has access to, and how many carry replies the user has not read. [[#metadata]]
**What each status count includes.** New counts open tickets that are not on hold and have no follow-ups at all. Active counts open tickets that are not on hold with at least one follow-up. On hold counts every ticket carrying the hold flag, closed ones as well, which is why lifting a hold moves a ticket between two of these numbers and closing it does not. One query computes all of them from plaintext columns over the accessible queues, and an account belonging to no queue gets zeros rather than an error. [[#server-holds #metadata]]
**Why the unread number arrives after the others.** It is assembled in the browser. A sweep enumerates the account's read-cursor rows across every open ticket it has access to, each cursor decrypts in the crypto worker, and the number is reported once all of them have settled, so it is absent for the first moments of a load rather than starting at zero. No server count stands behind it, because the server cannot read a cursor. [Unread badges](#tickets/unread-badges) covers what makes a ticket unread. [[#encryption #client-data]]
**The caught-up line.** A line stating that nothing is unread is shown when the new replies first sort is on, the sweep finds no unread ticket anywhere in the account's queues, no search is running and the list has rows. It reports the account's present state across all of its queues and carries no date. [[#client-data]]
**The counts query and the sweep.** \`counts\` in \`packages/server/src/tickets/ticket-service.ts\` sums one case expression per bucket in a single pass with a left join for follow-up totals, the sweep is \`readStateSweep\` in the same service against \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\`, and the line's condition is \`showCaughtUpLine\` in \`packages/client/src/lib/tickets/ticket-list-utils.ts\`. [[#metadata]]`)
};

const es_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los conteos indican cuántos tickets están nuevos, activos y en espera en todas las colas a las que tiene acceso la persona usuaria, y cuántos llevan respuestas que no ha leído. [[#metadata]]
**Qué incluye cada conteo de estado.** Nuevos cuenta los tickets abiertos que no están en espera y no tienen ningún seguimiento. Activos cuenta los tickets abiertos que no están en espera y tienen al menos un seguimiento. En espera cuenta todos los tickets con la marca de espera, también los cerrados, y por eso levantar una espera mueve un ticket entre dos de estos números y cerrarlo no. Una sola consulta los calcula todos a partir de columnas en texto plano sobre las colas accesibles, y una cuenta que no pertenece a ninguna cola recibe ceros en lugar de un error. [[#server-holds #metadata]]
**Por qué el número de no leídos llega después que los demás.** Se arma en el navegador. Un barrido enumera las filas de cursor de lectura de la cuenta en todos los tickets abiertos a los que tiene acceso, cada cursor se descifra en el worker criptográfico y el número se indica cuando todos se han asentado, de modo que no aparece durante los primeros instantes de una carga en lugar de empezar en cero. Detrás no hay ningún recuento del servidor, porque el servidor no puede leer un cursor. [Insignias de no leídos](#tickets/unread-badges) trata qué hace que un ticket esté sin leer. [[#encryption #client-data]]
**La línea de al día.** Se muestra una línea que indica que no queda nada sin leer cuando está activado el orden de nuevas respuestas primero, el barrido no encuentra ningún ticket sin leer en las colas de la cuenta, no hay ninguna búsqueda en curso y la lista tiene filas. Indica el estado actual de la cuenta en todas sus colas y no lleva ninguna fecha. [[#client-data]]
**La consulta de recuentos y el barrido.** \`counts\`, en \`packages/server/src/tickets/ticket-service.ts\`, suma una expresión condicional por grupo en una sola pasada con una unión externa para los totales de seguimientos, el barrido es \`readStateSweep\`, en el mismo servicio, contra \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\`, y la condición de la línea es \`showCaughtUpLine\`, en \`packages/client/src/lib/tickets/ticket-list-utils.ts\`. [[#metadata]]`)
};

const en_xa2_demo_narrative_topic_list_stats_body = /** @type {(inputs: Demo_Narrative_Topic_List_Stats_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè ròw ùndèr thè pàgè tìtlè shòws lìvè còùnts fòr nèw, àctìvè, ànd òn hòld tìckèts, às wèll às à nèw rèplìès còùnt òncè thè bròwsèr fìnìshès chèckìng rèàd stàtè.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Càùght ùp stàmp. •••••** Whèn èvèry tìckèt hàs bèèn rèàd, à dàtèlìnè stàmp àppèàrs àbòvè thè lìst màrkìng thè mòmènt thè vòlùntèèr càùght ùp. Nèw tìckèts àrrìvìng àftèr thàt pòìnt stàck àbòvè ìt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèrè thè nùmbèrs còmè fròm. •••••••••** Thè stàtùs còùnts àrè còmpùtèd fròm plàìntèxt mètàdàtà còlùmns, sò thè sèrvèr pròvìdès thèm wìthòùt rèàdìng àny tìckèt còntènt. Thè nèw rèplìès còùnt còmès fròm thè pèr vòlùntèèr rèàd tràckìng dèscrìbèd ìn thè ùnrèàd bàdgès sèctìòn. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The counts report how many tickets are new, active and on hold across every queue the user has access to, and how many carry replies the user has not read. [..." |
*
* @param {Demo_Narrative_Topic_List_Stats_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_stats_body = /** @type {((inputs?: Demo_Narrative_Topic_List_Stats_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_List_Stats_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_list_stats_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_list_stats_body(inputs)
	return en_demo_narrative_topic_list_stats_body(inputs)
});