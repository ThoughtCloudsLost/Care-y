/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Date_Separators_BodyInputs */

const en_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A dateline marks each change of day in the thread, and a line marks where reading stopped last time. [[#client-data]]
**Where the day boundary comes from.** Two entries fall on different days when their calendar dates differ in the device's own time zone, which the browser decides from the timestamps it already has. The same implementation draws the line on the case thread and on the client's own thread, so a client and a user reading one conversation see the days split in the same places. Someone reading on a device set to another zone sees the boundaries their own device implies. [[#failure-states #privacy]]
**What the unread line is read from.** One encrypted marker per account per case, sealed with the case key and bound to that account's own slot, holding the point reading last reached. The server stores it as opaque bytes and cannot tell how much of a case anyone has read, or whether the marker it holds means anything at all, because a case opened for the first time gets a row of random bytes the same size. What the row does tell the server is that the account opened the case, which is why the case list never creates one. [[#encryption #server-holds #metadata]]
**When the marker is written.** Reading progress is held for a few seconds and written once rather than on every entry that passes, and closing a case deletes every account's marker for it, so a closed case carries no record of who read how far. [Closing and reopening](#ticket-detail/close-reopen) covers what else a close removes. [[#retention #privacy]]
**Reaching the line in a long case.** With the last read point older than the entries first loaded, older pages are fetched until it is in view. [The conversation thread](#ticket-detail/conversation) covers that paging. [[#failure-states]]
**The separator and the cursor service.** \`formatDateSeparator\` and \`needsDateSeparator\` in \`packages/client/src/lib/utils/time.ts\` decide and label the breaks, and \`DateSeparator.svelte\` draws them for both threads. The marker is handled by \`create-read-cursor.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` against \`packages/server/src/tickets/read-cursor-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una línea de fecha marca cada cambio de día en el hilo, y otra marca dónde se detuvo la lectura la vez anterior. [[#client-data]]
**De dónde sale el límite entre días.** Dos entradas caen en días distintos cuando sus fechas de calendario difieren en la zona horaria del propio dispositivo, algo que el navegador decide con las fechas que ya tiene. La misma implementación dibuja la línea en el hilo del caso y en el hilo propio del cliente, de modo que un cliente y una persona usuaria que leen una misma conversación ven los días partidos en los mismos puntos. Quien lee en un dispositivo configurado en otra zona ve los límites que implica su propio dispositivo. [[#failure-states #privacy]]
**De dónde sale la línea de no leído.** Una marca cifrada por cuenta y por caso, sellada con la clave del caso y ligada a la ranura propia de esa cuenta, que guarda hasta dónde llegó la lectura. El servidor la guarda como bytes opacos y no puede saber cuánto ha leído nadie de un caso, ni si la marca que guarda significa algo, porque un caso abierto por primera vez recibe una fila de bytes aleatorios del mismo tamaño. Lo que la fila sí le dice al servidor es que la cuenta abrió el caso, y por eso la lista de casos no crea ninguna. [[#encryption #server-holds #metadata]]
**Cuándo se escribe la marca.** El avance de lectura se retiene unos segundos y se escribe una sola vez en lugar de con cada entrada que pasa, y cerrar un caso borra la marca de todas las cuentas, de modo que un caso cerrado no conserva registro de quién leyó hasta dónde. [Cerrar y reabrir](#ticket-detail/close-reopen) trata lo demás que retira un cierre. [[#retention #privacy]]
**Llegar a la línea en un caso largo.** Si el último punto leído es anterior a las entradas cargadas al abrir, se traen páginas anteriores hasta que queda a la vista. [El hilo de conversación](#ticket-detail/conversation) trata esa paginación. [[#failure-states]]
**El separador y el servicio de marcas.** \`formatDateSeparator\` y \`needsDateSeparator\`, en \`packages/client/src/lib/utils/time.ts\`, deciden y etiquetan los cortes, y \`DateSeparator.svelte\` los dibuja para ambos hilos. La marca la gestiona \`create-read-cursor.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, contra \`packages/server/src/tickets/read-cursor-service.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_date_separators_body = /** @type {(inputs: Demo_Narrative_Topic_Date_Separators_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè sèpàràtòrs màrk whèrè ònè dày ènds ànd thè nèxt bègìns, ànd lòng cònvèrsàtìòns lòàd ìn pàgès thàt àrè fètchèd ànd dècryptèd às thè vòlùntèèr scròlls ùp thròùgh òldèr hìstòry. À vòlùntèèr rètùrnìng tò à bùsy tìckèt àlsò lànds òn àn ùnrèàd lìnè àbòvè thè fìrst mèssàgè thàt àrrìvèd sìncè thèìr làst vìsìt, whìch clèàrs òncè thòsè mèssàgès hàvè bèèn sèèn. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A dateline marks each change of day in the thread, and a line marks where reading stopped last time. [[#client-data]] **Where the day boundary comes from.** ..." |
*
* @param {Demo_Narrative_Topic_Date_Separators_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_date_separators_body = /** @type {((inputs?: Demo_Narrative_Topic_Date_Separators_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Date_Separators_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_date_separators_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_date_separators_body(inputs)
	return en_demo_narrative_topic_date_separators_body(inputs)
});