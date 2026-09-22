/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_BodyInputs */

const en_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filters narrow the case thread by kind of entry, by who wrote it, and by a date range, and the three combine. [[#client-data]]
**What a filter is answered from.** The kind, the author, the source and the timestamp of every entry are plaintext columns, so the narrowing is a database query rather than a pass over decrypted text. That is what makes it fast and also what it costs: the server learns that someone asked for one person's entries on a case between two dates, while the words in them stay closed. [The trust boundary](#deep-dive/the-trust-boundary) lists the columns a query can reach. [[#metadata #server-holds #trust-boundary]]
**The one narrowing done in the browser.** Choosing a particular note type is applied after the response arrives, because the query asks for internal notes as a class. Note types an account's role may not view are dropped by the server before that, so a filter cannot surface a note the role could not otherwise read. [Note types](#admin-org/note-types) covers the view restriction. [[#permissions #privacy]]
**What a filtered view is missing.** A filtered request returns up to two hundred entries with each one's position in the full thread, and the count of entries skipped between two neighbours is reported where they fall. Clearing the filters returns to the paged thread rather than refetching it. [The conversation thread](#ticket-detail/conversation) covers that paging. [[#failure-states]]
**Where the translation happens.** \`create-detail-filters.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` owns the selections and their labels, and \`TicketDetail.svelte\` maps the grouped choices onto concrete entry types before the request, expanding assignment, status, priority, queue and hold into the event types each one covers. [[#client-data]]`)
};

const es_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los filtros reducen el hilo del caso por tipo de entrada, por quién la escribió y por un intervalo de fechas, y los tres se combinan. [[#client-data]]
**Con qué se responde a un filtro.** El tipo, la autoría, el origen y la fecha de cada entrada son columnas en texto plano, así que la reducción es una consulta a la base de datos y no un recorrido sobre texto descifrado. Eso es lo que la hace rápida y también lo que cuesta: el servidor se entera de que alguien pidió las entradas de una persona en un caso entre dos fechas, mientras las palabras que contienen siguen cerradas. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera las columnas que una consulta alcanza. [[#metadata #server-holds #trust-boundary]]
**La única reducción que ocurre en el navegador.** Elegir un tipo de nota concreto se aplica después de que llegue la respuesta, porque la consulta pide las notas internas como clase. Los tipos de nota que el rol de una cuenta no puede ver los descarta antes el servidor, de modo que un filtro no puede sacar a la luz una nota que ese rol no podría leer de otro modo. [Tipos de nota](#admin-org/note-types) trata esa restricción de vista. [[#permissions #privacy]]
**Lo que le falta a una vista filtrada.** Una petición filtrada devuelve hasta doscientas entradas con la posición de cada una en el hilo completo, y el número de entradas saltadas entre dos vecinas se indica donde corresponde. Quitar los filtros devuelve al hilo paginado en lugar de volver a pedirlo. [El hilo de conversación](#ticket-detail/conversation) trata esa paginación. [[#failure-states]]
**Dónde ocurre la traducción.** \`create-detail-filters.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, guarda las selecciones y sus etiquetas, y \`TicketDetail.svelte\` convierte las opciones agrupadas en tipos concretos de entrada antes de la petición, expandiendo asignación, estado, prioridad, cola y espera en los tipos de evento que cada una abarca. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thrèàd fìltèrs nàrròw thè vìsìblè mèssàgès by mèssàgè typè, àùthòr, òr dàtè. Thè sèrvèr rètùrns thè màtchìng sèt ànd thè bròwsèr dècrypts thèm lòcàlly.
 ••••••••••••••••••••••••••••••••••••••••••••••**Mèssàgè typès. •••••** Clìènt mèssàgès, vòlùntèèr rèplìès, ìntèrnàl nòtès, stàtùs chàngès, òr àssìgnmènts càn èàch bè ìsòlàtèd.
 ••••••••••••••••••••••••••••••••**Àùthòr fìltèr. •••••** Ìn tìckèts wìth mùltìplè vòlùntèèrs, mèssàgès fròm à spècìfìc pèrsòn càn bè shòwn àlònè. •••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filters narrow the case thread by kind of entry, by who wrote it, and by a date range, and the three combine. [[#client-data]] **What a filter is answered fr..." |
*
* @param {Demo_Narrative_Topic_Thread_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Thread_Filters_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Thread_Filters_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_thread_filters_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_thread_filters_body(inputs)
	return en_demo_narrative_topic_thread_filters_body(inputs)
});