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
	return /** @type {LocalizedString} */ (`⟦Thè tìmèlìnè prèsènts thè whòlè càsè às à dàtèd ìndèx: rècòrdèd èvènts ànd nòtès nàmèd ònè by ònè, rùns òf mèssàgès còllàpsèd ìntò à sìnglè lìnè càrryìng hòw màny càmè ìn ànd hòw màny wènt òùt. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why mèssàgès àrrìvè wìthòùt thèìr wòrds. ••••••••••••** Thè rèqùèst thàt bùìlds thè ìndèx rètùrns thè còntènt òf nòtès, rècòrdèd èvènts ànd càlls, ànd wìthhòlds thè bòdy òf èvèry òrdìnàry mèssàgè. Òpènìng ònè òf thè còllàpsèd rùns fètchès thòsè bòdìès by ìdèntìfìèr, ùp tò twò hùndrèd àt à tìmè. Sò rèvìèwìng à lòng càsè còsts ònè smàll rèqùèst ìnstèàd òf dècryptìng à yèàr òf cònvèrsàtìòn tò dràw à lìst. [[#èncryptìòn #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè ìndèx rèpòrts àbòùt mèdìà. •••••••••••** Whèthèr àn èntry càrrìès à rècòrdìng, àn ìmàgè òr à fìlè, ànd thè lòngèst rècòrdìng's dùràtìòn, èàch òf whìch thè sèrvèr ànswèrs fròm thè ròws bèsìdè thè èntry ràthèr thàn fròm ànythìng ìt òpènèd. À dàtàbàsè dùmp shòws thè sàmè shàpè: hòw màny èntrìès à càsè hàs, whèn èàch àrrìvèd, whìch càrrìèd àn àttàchmènt ànd hòw lòng à rècòrdìng ràn. [Ìmàgès ànd àttàchmènts](#tìckèt-dètàìl/mèdìà-ìmàgès) còvèrs thè fìlès thèmsèlvès. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt ìt shàrès wìth thè thrèàd. ••••••••••** Thè sàmè fìltèrs àpply, ànd thè sàmè ròlè rèstrìctìòn òn nòtè typès, sò àn èntry àbsènt fròm thè thrèàd ìs àbsènt hèrè. Sèàrchìng ìn thìs vìèw màtchès ònly thè èntrìès whòsè còntènt thè ìndèx càrrìès. [Thrèàd fìltèrs](#tìckèt-dètàìl/thrèàd-fìltèrs) còvèrs thè nàrròwìng, ànd [Sèàrchìng à càsè](#tìckèt-dètàìl/dèèp-sèàrch) còvèrs thàt dìffèrèncè. [[#pèrmìssìòns #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ìndèx rèqùèst ànd ìts còmpònènt. •••••••••••** \`lìstFòllòwÙpSùmmàry\` ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\` dèfàùlts tò fìvè hùndrèd èntrìès ànd àccèpts twò thòùsànd, ànd thè wìthhòldìng rùlè ìs ìn \`lìstSùmmàry\` ìn \`pàckàgès/sèrvèr/src/tìckèts/fòllòwùp-sèrvìcè.ts\`. Thè vìèw ìs \`FòllòwÙpTìmèlìnè.svèltè\`, whòsè làndmàrk ànd clùstèr shàpès àrè ìn \`fòllòw-ùp-tìmèlìnè-typès.ts\`. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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