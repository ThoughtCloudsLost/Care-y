/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Timeline_BodyInputs */

const en_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The timeline indexes a ticket's follow-ups by date. Notes, recorded events, and calls appear individually with their content. Ordinary messages are collapsed into clusters that report how many arrived inbound and how many went outbound. [[#client-data]]
**Why do messages arrive without their content?** The index returns the content of notes, recorded events, and calls. It withholds the content of ordinary messages. Expanding a cluster fetches those bodies by identifier. Reviewing a long ticket costs one small request rather than decrypting every message to draw the index. [[#encryption #client-data]]
**What does the index report about media?** Each follow-up reports whether it carries a recording, an image, or a file. The index also reports the longest recording's duration. The server reads all of that from metadata stored alongside the follow-up, not from the follow-up's encrypted content. A database dump reveals the same shape. It shows how many follow-ups a ticket has, when each arrived, which carried an attachment, and how long a recording ran. [Photos and MMS](#ticket-detail/media-images) covers the files themselves. [[#server-holds #metadata]]
**What does the timeline share with the thread?** The same filters apply, and the same role restriction on note types. A follow-up that the thread hides is also hidden here. Searching in this view matches only notes, recorded events, and calls, because ordinary messages have no content in the index. [Filtering a conversation](#ticket-detail/thread-filters) covers the narrowing, and [In thread search](#ticket-detail/deep-search) covers that difference. [[#permissions #failure-states]]
**The index endpoint and its component.** \`listFollowUpSummary\` in \`packages/server/src/routes/tickets.ts\` defaults to five hundred follow-ups and accepts two thousand; the withholding rule is \`listSummary\` in \`packages/server/src/tickets/followup-service.ts\`. The view is \`FollowUpTimeline.svelte\`. Its landmark and cluster shapes are in \`follow-up-timeline-types.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La línea de tiempo indexa los seguimientos de un ticket por fecha. Las notas, los eventos registrados y las llamadas aparecen individualmente con su contenido. Los mensajes ordinarios se agrupan en bloques que informan cuántos llegaron de entrada y cuántos de salida. [[#client-data]]
**¿Por qué los mensajes llegan sin su contenido?** El índice devuelve el contenido de notas, eventos registrados y llamadas. Retiene el contenido de los mensajes ordinarios. Al expandir un bloque se obtienen esos cuerpos por identificador. Revisar un ticket largo cuesta una sola solicitud en lugar de descifrar cada mensaje para construir el índice. [[#encryption #client-data]]
**¿Qué informa el índice sobre archivos multimedia?** Cada seguimiento informa si tiene una grabación, una imagen o un archivo. El índice también informa la duración de la grabación más larga. El servidor lee todo eso de los metadatos almacenados junto al seguimiento, no del contenido cifrado del seguimiento. Un volcado de la base de datos revela la misma forma. Muestra cuántos seguimientos tiene un ticket, cuándo llegó cada uno, cuál tenía un adjunto y cuánto duró una grabación. [Fotos y MMS](#ticket-detail/media-images) trata los archivos en sí. [[#server-holds #metadata]]
**¿Qué comparte la línea de tiempo con el hilo?** Se aplican los mismos filtros y la misma restricción de rol sobre tipos de nota. Un seguimiento que el hilo oculta también se oculta aquí. La búsqueda en esta vista coincide solo con notas, eventos registrados y llamadas, porque los mensajes ordinarios no tienen contenido en el índice. [Filtrando una conversación](#ticket-detail/thread-filters) trata el filtrado, y [Búsqueda en el hilo](#ticket-detail/deep-search) trata esa diferencia. [[#permissions #failure-states]]
**El endpoint del índice y su componente.** \`listFollowUpSummary\` en \`packages/server/src/routes/tickets.ts\` tiene un valor predeterminado de quinientos seguimientos y acepta dos mil; la regla de retención está en \`listSummary\` en \`packages/server/src/tickets/followup-service.ts\`. La vista es \`FollowUpTimeline.svelte\`. Sus formas de hito y bloque están en \`follow-up-timeline-types.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìmèlìnè ìndèxès à tìckèt's fòllòw-ùps by dàtè. Nòtès, rècòrdèd èvènts, ànd càlls àppèàr ìndìvìdùàlly wìth thèìr còntènt. Òrdìnàry mèssàgès àrè còllàpsèd ìntò clùstèrs thàt rèpòrt hòw màny àrrìvèd ìnbòùnd ànd hòw màny wènt òùtbòùnd. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why dò mèssàgès àrrìvè wìthòùt thèìr còntènt? ••••••••••••••** Thè ìndèx rètùrns thè còntènt òf nòtès, rècòrdèd èvènts, ànd càlls. Ìt wìthhòlds thè còntènt òf òrdìnàry mèssàgès. Èxpàndìng à clùstèr fètchès thòsè bòdìès by ìdèntìfìèr. Rèvìèwìng à lòng tìckèt còsts ònè smàll rèqùèst ràthèr thàn dècryptìng èvèry mèssàgè tò dràw thè ìndèx. [[#èncryptìòn #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè ìndèx rèpòrt àbòùt mèdìà? ••••••••••••** Èàch fòllòw-ùp rèpòrts whèthèr ìt càrrìès à rècòrdìng, àn ìmàgè, òr à fìlè. Thè ìndèx àlsò rèpòrts thè lòngèst rècòrdìng's dùràtìòn. Thè sèrvèr rèàds àll òf thàt fròm mètàdàtà stòrèd àlòngsìdè thè fòllòw-ùp, nòt fròm thè fòllòw-ùp's èncryptèd còntènt. À dàtàbàsè dùmp rèvèàls thè sàmè shàpè. Ìt shòws hòw màny fòllòw-ùps à tìckèt hàs, whèn èàch àrrìvèd, whìch càrrìèd àn àttàchmènt, ànd hòw lòng à rècòrdìng ràn. [Phòtòs ànd MMS](#tìckèt-dètàìl/mèdìà-ìmàgès) còvèrs thè fìlès thèmsèlvès. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè tìmèlìnè shàrè wìth thè thrèàd? ••••••••••••••** Thè sàmè fìltèrs àpply, ànd thè sàmè ròlè rèstrìctìòn òn nòtè typès. À fòllòw-ùp thàt thè thrèàd hìdès ìs àlsò hìddèn hèrè. Sèàrchìng ìn thìs vìèw màtchès ònly nòtès, rècòrdèd èvènts, ànd càlls, bècàùsè òrdìnàry mèssàgès hàvè nò còntènt ìn thè ìndèx. [Fìltèrìng à cònvèrsàtìòn](#tìckèt-dètàìl/thrèàd-fìltèrs) còvèrs thè nàrròwìng, ànd [Ìn thrèàd sèàrch](#tìckèt-dètàìl/dèèp-sèàrch) còvèrs thàt dìffèrèncè. [[#pèrmìssìòns #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ìndèx èndpòìnt ànd ìts còmpònènt. ••••••••••••** \`lìstFòllòwÙpSùmmàry\` ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\` dèfàùlts tò fìvè hùndrèd fòllòw-ùps ànd àccèpts twò thòùsànd; thè wìthhòldìng rùlè ìs \`lìstSùmmàry\` ìn \`pàckàgès/sèrvèr/src/tìckèts/fòllòwùp-sèrvìcè.ts\`. Thè vìèw ìs \`FòllòwÙpTìmèlìnè.svèltè\`. Ìts làndmàrk ànd clùstèr shàpès àrè ìn \`fòllòw-ùp-tìmèlìnè-typès.ts\`. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The timeline indexes a ticket's follow-ups by date. Notes, recorded events, and calls appear individually with their content. Ordinary messages are collapsed..." |
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