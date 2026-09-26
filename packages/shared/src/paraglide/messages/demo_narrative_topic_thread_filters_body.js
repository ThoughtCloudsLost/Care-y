/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_BodyInputs */

const en_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filters narrow the ticket's case thread by kind of entry, by author, and by a date range, and the three combine. [[#client-data]]
**What does the server answer from?** The kind, the author, the source and the timestamp of every entry are plaintext columns. The server evaluates these directly as a database query rather than a pass over decrypted text. The server learns that someone asked for one author's entries on one ticket between two dates, while the words in those entries stay closed. [The trust boundary](#deep-dive/the-trust-boundary) lists the columns a query can reach. [[#metadata #server-holds #trust-boundary]]
**Note type narrowing in the browser.** Choosing a particular note type is applied after the response arrives, because the request asks for internal notes as a class. The server drops note types the account's role may not view before that, so a filter cannot surface a note the role could not otherwise read. [Note types](#admin-org/note-types) covers the view restriction. [[#permissions #privacy]]
**Gap indicators.** A filtered request returns up to two hundred entries. Each entry carries its position in the full unfiltered thread and the total unfiltered count. Where entries were skipped between two neighbours, the count of skipped entries is reported in line. Clearing the filters returns to the paged thread rather than refetching it. [Conversation thread](#ticket-detail/conversation) covers that paging. [[#failure-states]]
**The filter composable and the type expansion.** \`create-detail-filters.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` owns the selections and their labels. \`TicketDetail.svelte\` maps the grouped choices onto concrete entry types before the request, expanding assignment, status, priority, queue and hold into the event types each one covers. [[#client-data]]`)
};

const es_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los filtros acotan el hilo de caso unificado del ticket por tipo de entrada, por autor y por rango de fechas, y los tres se combinan. [[#client-data]]
**¿A partir de qué responde el servidor?** El tipo, el autor, el origen y la marca de tiempo de cada entrada son columnas en texto plano. El servidor las evalúa directamente como una consulta a la base de datos en lugar de recorrer texto descifrado. El servidor sabe que alguien pidió las entradas de un autor en un ticket entre dos fechas, mientras que las palabras de esas entradas permanecen cerradas. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera las columnas que una consulta puede alcanzar. [[#metadata #server-holds #trust-boundary]]
**Filtrado de tipo de nota en el navegador.** Elegir un tipo de nota concreto se aplica después de que la respuesta llega, porque la solicitud pide notas internas como clase. El servidor descarta los tipos de nota que el rol de la cuenta no puede ver antes de eso, de modo que un filtro no puede mostrar una nota que el rol no podría leer de otro modo. [Tipos de nota](#admin-org/note-types) trata la restricción de visibilidad. [[#permissions #privacy]]
**Indicadores de salto.** Una solicitud filtrada devuelve hasta doscientas entradas. Cada entrada lleva su posición en el hilo completo sin filtrar y el recuento total sin filtrar. Donde se omitieron entradas entre dos vecinas, el recuento de entradas omitidas se muestra en línea. Limpiar los filtros vuelve al hilo paginado en lugar de volver a solicitarlo. [Hilo de conversación](#ticket-detail/conversation) trata esa paginación. [[#failure-states]]
**El composable de filtros y la expansión de tipos.** \`create-detail-filters.svelte.ts\` en \`packages/client/src/lib/composables/ticket-detail/\` gestiona las selecciones y sus etiquetas. \`TicketDetail.svelte\` traduce las opciones agrupadas a tipos de entrada concretos antes de la solicitud, expandiendo asignación, estado, prioridad, cola y espera a los tipos de evento que cada uno abarca. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèrs nàrròw thè tìckèt's càsè thrèàd by kìnd òf èntry, by àùthòr, ànd by à dàtè ràngè, ànd thè thrèè còmbìnè. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr ànswèr fròm? ••••••••••** Thè kìnd, thè àùthòr, thè sòùrcè ànd thè tìmèstàmp òf èvèry èntry àrè plàìntèxt còlùmns. Thè sèrvèr èvàlùàtès thèsè dìrèctly às à dàtàbàsè qùèry ràthèr thàn à pàss òvèr dècryptèd tèxt. Thè sèrvèr lèàrns thàt sòmèònè àskèd fòr ònè àùthòr's èntrìès òn ònè tìckèt bètwèèn twò dàtès, whìlè thè wòrds ìn thòsè èntrìès stày clòsèd. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) lìsts thè còlùmns à qùèry càn rèàch. [[#mètàdàtà #sèrvèr-hòlds #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nòtè typè nàrròwìng ìn thè bròwsèr. •••••••••••** Chòòsìng à pàrtìcùlàr nòtè typè ìs àpplìèd àftèr thè rèspònsè àrrìvès, bècàùsè thè rèqùèst àsks fòr ìntèrnàl nòtès às à clàss. Thè sèrvèr dròps nòtè typès thè àccòùnt's ròlè mày nòt vìèw bèfòrè thàt, sò à fìltèr cànnòt sùrfàcè à nòtè thè ròlè còùld nòt òthèrwìsè rèàd. [Nòtè typès](#àdmìn-òrg/nòtè-typès) còvèrs thè vìèw rèstrìctìòn. [[#pèrmìssìòns #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Gàp ìndìcàtòrs. •••••** À fìltèrèd rèqùèst rètùrns ùp tò twò hùndrèd èntrìès. Èàch èntry càrrìès ìts pòsìtìòn ìn thè fùll ùnfìltèrèd thrèàd ànd thè tòtàl ùnfìltèrèd còùnt. Whèrè èntrìès wèrè skìppèd bètwèèn twò nèìghbòùrs, thè còùnt òf skìppèd èntrìès ìs rèpòrtèd ìn lìnè. Clèàrìng thè fìltèrs rètùrns tò thè pàgèd thrèàd ràthèr thàn rèfètchìng ìt. [Cònvèrsàtìòn thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) còvèrs thàt pàgìng. [[#fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fìltèr còmpòsàblè ànd thè typè èxpànsìòn. ••••••••••••••** \`crèàtè-dètàìl-fìltèrs.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` òwns thè sèlèctìòns ànd thèìr làbèls. \`TìckètDètàìl.svèltè\` màps thè gròùpèd chòìcès òntò còncrètè èntry typès bèfòrè thè rèqùèst, èxpàndìng àssìgnmènt, stàtùs, prìòrìty, qùèùè ànd hòld ìntò thè èvènt typès èàch ònè còvèrs. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filters narrow the ticket's case thread by kind of entry, by author, and by a date range, and the three combine. [[#client-data]] **What does the server answ..." |
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