/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Thread_Filters_BodyInputs */

const en_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filters narrow the ticket's case thread by entry kind, by author, and by a date range, and all three combine to select a smaller set. [[#client-data]]
**What does the server answer from?** The kind, the author, the source, and the timestamp of every entry are stored unencrypted. The server evaluates a filter request as a database query against those fields and never sees decrypted text. The server learns which author was requested, on which ticket, between which dates. The words in those entries stay sealed. [The trust boundary](#deep-dive/the-trust-boundary) lists the columns a query can reach. [[#metadata #server-holds #trust-boundary]]
**Note type narrowing in the browser.** A particular note type is narrowed in the browser after the response arrives, because the request groups all internal notes into one class. Before responding, the server removes note types the user's role may not view. A filter cannot surface a note the role could not otherwise read. [Note types](#admin-org/note-types) covers the view restriction. [[#permissions #privacy]]
**Gap indicators.** A filtered request returns up to two hundred entries. Each entry carries its position in the full unfiltered thread and the total unfiltered count. Where entries were skipped between two neighbours, the count of skipped entries is reported in line. Clearing the filters restores the paged thread already held, with no new request. [Conversation thread](#ticket-detail/conversation) covers that paging. [[#failure-states]]
**The filter composable and the type expansion.** \`create-detail-filters.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` owns the selections and their labels. \`TicketDetail.svelte\` maps the grouped choices onto concrete entry types before the request, expanding assignment, status, priority, queue and hold into the event types each one covers. [[#client-data]]`)
};

const es_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los filtros acotan el hilo de caso unificado del ticket por tipo de entrada, por autor y por rango de fechas, y los tres se combinan para seleccionar un conjunto más reducido. [[#client-data]]
**¿A partir de qué responde el servidor?** El tipo, el autor, el origen y la marca de tiempo de cada entrada se almacenan sin cifrar. El servidor evalúa una solicitud de filtro como una consulta a la base de datos contra esos campos y nunca ve texto descifrado. El servidor sabe qué autor se pidió, en qué ticket y entre qué fechas. Las palabras de esas entradas permanecen selladas. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera las columnas que una consulta puede alcanzar. [[#metadata #server-holds #trust-boundary]]
**Filtrado de tipo de nota en el navegador.** Un tipo de nota concreto se filtra en el navegador después de que la respuesta llega, porque la solicitud agrupa todas las notas internas en una sola clase. Antes de responder, el servidor descarta los tipos de nota que el rol de la persona usuaria no puede ver. Un filtro no puede mostrar una nota que el rol no podría leer de otro modo. [Tipos de nota](#admin-org/note-types) trata la restricción de visibilidad. [[#permissions #privacy]]
**Indicadores de salto.** Una solicitud filtrada devuelve hasta doscientas entradas. Cada entrada lleva su posición en el hilo completo sin filtrar y el recuento total sin filtrar. Donde se omitieron entradas entre dos vecinas, el recuento de entradas omitidas se muestra en línea. Limpiar los filtros restaura el hilo paginado que ya se tiene, sin nueva solicitud. [Hilo de conversación](#ticket-detail/conversation) trata esa paginación. [[#failure-states]]
**El composable de filtros y la expansión de tipos.** \`create-detail-filters.svelte.ts\` en \`packages/client/src/lib/composables/ticket-detail/\` gestiona las selecciones y sus etiquetas. \`TicketDetail.svelte\` traduce las opciones agrupadas a tipos de entrada concretos antes de la solicitud, expandiendo asignación, estado, prioridad, cola y espera a los tipos de evento que cada uno abarca. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_thread_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Thread_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìltèrs nàrròw thè tìckèt's càsè thrèàd by èntry kìnd, by àùthòr, ànd by à dàtè ràngè, ànd àll thrèè còmbìnè tò sèlèct à smàllèr sèt. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè sèrvèr ànswèr fròm? ••••••••••** Thè kìnd, thè àùthòr, thè sòùrcè, ànd thè tìmèstàmp òf èvèry èntry àrè stòrèd ùnèncryptèd. Thè sèrvèr èvàlùàtès à fìltèr rèqùèst às à dàtàbàsè qùèry àgàìnst thòsè fìèlds ànd nèvèr sèès dècryptèd tèxt. Thè sèrvèr lèàrns whìch àùthòr wàs rèqùèstèd, òn whìch tìckèt, bètwèèn whìch dàtès. Thè wòrds ìn thòsè èntrìès stày sèàlèd. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) lìsts thè còlùmns à qùèry càn rèàch. [[#mètàdàtà #sèrvèr-hòlds #trùst-bòùndàry]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Nòtè typè nàrròwìng ìn thè bròwsèr. •••••••••••** À pàrtìcùlàr nòtè typè ìs nàrròwèd ìn thè bròwsèr àftèr thè rèspònsè àrrìvès, bècàùsè thè rèqùèst gròùps àll ìntèrnàl nòtès ìntò ònè clàss. Bèfòrè rèspòndìng, thè sèrvèr rèmòvès nòtè typès thè ùsèr's ròlè mày nòt vìèw. À fìltèr cànnòt sùrfàcè à nòtè thè ròlè còùld nòt òthèrwìsè rèàd. [Nòtè typès](#àdmìn-òrg/nòtè-typès) còvèrs thè vìèw rèstrìctìòn. [[#pèrmìssìòns #prìvàcy]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Gàp ìndìcàtòrs. •••••** À fìltèrèd rèqùèst rètùrns ùp tò twò hùndrèd èntrìès. Èàch èntry càrrìès ìts pòsìtìòn ìn thè fùll ùnfìltèrèd thrèàd ànd thè tòtàl ùnfìltèrèd còùnt. Whèrè èntrìès wèrè skìppèd bètwèèn twò nèìghbòùrs, thè còùnt òf skìppèd èntrìès ìs rèpòrtèd ìn lìnè. Clèàrìng thè fìltèrs rèstòrès thè pàgèd thrèàd àlrèàdy hèld, wìth nò nèw rèqùèst. [Cònvèrsàtìòn thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) còvèrs thàt pàgìng. [[#fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè fìltèr còmpòsàblè ànd thè typè èxpànsìòn. ••••••••••••••** \`crèàtè-dètàìl-fìltèrs.svèltè.ts\` ìn \`pàckàgès/clìènt/src/lìb/còmpòsàblès/tìckèt-dètàìl/\` òwns thè sèlèctìòns ànd thèìr làbèls. \`TìckètDètàìl.svèltè\` màps thè gròùpèd chòìcès òntò còncrètè èntry typès bèfòrè thè rèqùèst, èxpàndìng àssìgnmènt, stàtùs, prìòrìty, qùèùè ànd hòld ìntò thè èvènt typès èàch ònè còvèrs. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Filters narrow the ticket's case thread by entry kind, by author, and by a date range, and all three combine to select a smaller set. [[#client-data]] **What..." |
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