/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Timeline_BodyInputs */

const en_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The timeline presents the whole case as a dated index: recorded events and notes named one by one, runs of messages collapsed into a single line carrying how many came in and how many went out. [[#client-data]]
**Why messages arrive without their words.** The request that builds the index returns the content of notes, recorded events and calls, and withholds the body of every ordinary message. Opening one of the collapsed runs fetches those bodies by identifier, up to two hundred at a time. So reviewing a long case costs one small request instead of decrypting a year of conversation to draw a list. [[#encryption #client-data]]
**What the index reports about media.** Whether an entry carries a recording, an image or a file, and the longest recording's duration, each of which the server answers from the rows beside the entry rather than from anything it opened. A database dump shows the same shape: how many entries a case has, when each arrived, which carried an attachment and how long a recording ran. [Images and attachments](#ticket-detail/media-images) covers the files themselves. [[#server-holds #metadata]]
**What it shares with the thread.** The same filters apply, and the same role restriction on note types, so an entry absent from the thread is absent here. Searching in this view matches only the entries whose content the index carries. [Thread filters](#ticket-detail/thread-filters) covers the narrowing, and [Searching a case](#ticket-detail/deep-search) covers that difference. [[#permissions #failure-states]]
**The index request and its component.** \`listFollowUpSummary\` in \`packages/server/src/routes/tickets.ts\` defaults to five hundred entries and accepts two thousand, and the withholding rule is in \`listSummary\` in \`packages/server/src/tickets/followup-service.ts\`. The view is \`FollowUpTimeline.svelte\`, whose landmark and cluster shapes are in \`follow-up-timeline-types.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La línea de tiempo presenta el caso entero como un índice por fechas: los eventos registrados y las notas nombrados uno a uno, y las rachas de mensajes plegadas en una sola línea que indica cuántos entraron y cuántos salieron. [[#client-data]]
**Por qué los mensajes llegan sin sus palabras.** La petición que construye el índice devuelve el contenido de las notas, los eventos registrados y las llamadas, y retiene el cuerpo de todos los mensajes corrientes. Abrir una de las rachas plegadas pide esos cuerpos por identificador, hasta doscientos cada vez. Así, revisar un caso largo cuesta una petición pequeña en lugar de descifrar un año de conversación para dibujar una lista. [[#encryption #client-data]]
**Lo que el índice indica sobre los archivos.** Si una entrada lleva una grabación, una imagen o un archivo, y la duración de la grabación más larga, datos que el servidor responde a partir de las filas contiguas a la entrada y no de nada que haya abierto. Un volcado de la base de datos muestra esa misma forma: cuántas entradas tiene un caso, cuándo llegó cada una, cuáles llevaban un adjunto y cuánto duró una grabación. [Imágenes y adjuntos](#ticket-detail/media-images) trata los archivos en sí. [[#server-holds #metadata]]
**Lo que comparte con el hilo.** Se aplican los mismos filtros y la misma restricción de rol sobre los tipos de nota, así que una entrada ausente del hilo también falta aquí. Buscar en esta vista solo compara las entradas cuyo contenido trae el índice. [Filtros del hilo](#ticket-detail/thread-filters) trata la reducción, y [Buscar en un caso](#ticket-detail/deep-search) trata esa diferencia. [[#permissions #failure-states]]
**La petición del índice y su componente.** \`listFollowUpSummary\`, en \`packages/server/src/routes/tickets.ts\`, pide quinientas entradas por defecto y admite dos mil, y la regla de retención está en \`listSummary\`, en \`packages/server/src/tickets/followup-service.ts\`. La vista es \`FollowUpTimeline.svelte\`, cuyas formas de hito y de racha están en \`follow-up-timeline-types.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè dètàìl vìèw ìnclùdès à tògglè bètwèèn thè cònvèrsàtìòn thrèàd ànd à tìmèlìnè vìèw. Thè tìmèlìnè rèplàcès thè mèssàgè thrèàd wìth à strùctùrèd chrònòlògìcàl òvèrvìèw shòwìng stàtùs chàngès, àssìgnmènts, nòtès, ànd mèssàgès clùstèrèd by dàtè wìth làndmàrk èntrìès màrkìng sìgnìfìcànt stàtè chàngès.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn tò ùsè ìt. •••••** Tìmèlìnè vìèw ìs ùsèfùl fòr rèvìèwìng thè fùll hìstòry òf à càsè, èspècìàlly whèn thè vòlùntèèr nèèds tò sèè whàt àctìòns wèrè tàkèn ànd whèn. Thè cònvèrsàtìòn vìèw ìs bèttèr fòr rèàdìng ànd rèplyìng tò mèssàgès.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Àll èntrìès ìn thè tìmèlìnè àrè dècryptèd lòcàlly, ànd thè sèrvèr stòrès thèm às òpàqùè cìphèrtèxt. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The timeline presents the whole case as a dated index: recorded events and notes named one by one, runs of messages collapsed into a single line carrying how..." |
*
* @param {Demo_Narrative_Topic_Timeline_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_timeline_body = /** @type {((inputs?: Demo_Narrative_Topic_Timeline_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Timeline_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_timeline_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_timeline_body(inputs)
	return en_demo_narrative_topic_timeline_body(inputs)
});