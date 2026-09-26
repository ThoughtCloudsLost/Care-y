/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Timeline_BodyInputs */

const en_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The timeline indexes a ticket's follow-ups by date. Notes, recorded events, and calls appear individually with their content. Ordinary messages are collapsed into clusters that report how many arrived inbound and how many went outbound. [[#client-data]]
**Why do messages arrive without their content?** The index request returns the content of notes, recorded events, and calls, and withholds the body of every ordinary message. Expanding a cluster fetches those bodies by identifier. Reviewing a long ticket costs one small request rather than decrypting every message to draw the index. [[#encryption #client-data]]
**What does the index report about media?** Whether a follow-up carries a recording, an image, or a file, and the longest recording's duration. The server answers all of that from the rows beside the follow-up rather than from anything it opened. A database dump reveals the same shape: how many follow-ups a ticket has, when each arrived, which carried an attachment, and how long a recording ran. [Photos and MMS](#ticket-detail/media-images) covers the files themselves. [[#server-holds #metadata]]
**What does the timeline share with the thread?** The same filters apply, and the same role restriction on note types, so a follow-up absent from the thread is absent here. Searching in this view matches only the follow-ups whose content the index carries. [Filtering a conversation](#ticket-detail/thread-filters) covers the narrowing, and [In thread search](#ticket-detail/deep-search) covers that difference. [[#permissions #failure-states]]
**The index endpoint and its component.** \`listFollowUpSummary\` in \`packages/server/src/routes/tickets.ts\` defaults to five hundred follow-ups and accepts two thousand; the withholding rule is \`listSummary\` in \`packages/server/src/tickets/followup-service.ts\`. The view is \`FollowUpTimeline.svelte\`; its landmark and cluster shapes are in \`follow-up-timeline-types.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La línea de tiempo indexa los seguimientos de un ticket por fecha. Las notas, los eventos registrados y las llamadas aparecen individualmente con su contenido. Los mensajes ordinarios se agrupan en bloques que informan cuántos llegaron de entrada y cuántos de salida. [[#client-data]]
**¿Por qué los mensajes llegan sin su contenido?** La solicitud del índice devuelve el contenido de notas, eventos registrados y llamadas, y retiene el cuerpo de cada mensaje ordinario. Al expandir un bloque se obtienen esos cuerpos por identificador. Revisar un ticket largo cuesta una sola solicitud en lugar de descifrar cada mensaje para construir el índice. [[#encryption #client-data]]
**¿Qué informa el índice sobre archivos multimedia?** Si un seguimiento tiene una grabación, una imagen o un archivo, y la duración de la grabación más larga. El servidor responde todo eso a partir de las filas junto al seguimiento, sin abrir nada. Un volcado de la base de datos revela la misma forma: cuántos seguimientos tiene un ticket, cuándo llegó cada uno, cuál tenía un adjunto y cuánto duró una grabación. [Fotos y MMS](#ticket-detail/media-images) trata los archivos en sí. [[#server-holds #metadata]]
**¿Qué comparte la línea de tiempo con el hilo?** Se aplican los mismos filtros y la misma restricción de rol sobre tipos de nota, así que un seguimiento ausente del hilo también está ausente aquí. La búsqueda en esta vista coincide solo con los seguimientos cuyo contenido el índice contiene. [Filtrando una conversación](#ticket-detail/thread-filters) trata el filtrado, y [Búsqueda en el hilo](#ticket-detail/deep-search) trata esa diferencia. [[#permissions #failure-states]]
**El endpoint del índice y su componente.** \`listFollowUpSummary\` en \`packages/server/src/routes/tickets.ts\` tiene un valor predeterminado de quinientos seguimientos y acepta dos mil; la regla de retención está en \`listSummary\` en \`packages/server/src/tickets/followup-service.ts\`. La vista es \`FollowUpTimeline.svelte\`; sus formas de hito y bloque están en \`follow-up-timeline-types.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_timeline_body = /** @type {(inputs: Demo_Narrative_Topic_Timeline_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè tìmèlìnè ìndèxès à tìckèt's fòllòw-ùps by dàtè. Nòtès, rècòrdèd èvènts, ànd càlls àppèàr ìndìvìdùàlly wìth thèìr còntènt. Òrdìnàry mèssàgès àrè còllàpsèd ìntò clùstèrs thàt rèpòrt hòw màny àrrìvèd ìnbòùnd ànd hòw màny wènt òùtbòùnd. [[#clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why dò mèssàgès àrrìvè wìthòùt thèìr còntènt? ••••••••••••••** Thè ìndèx rèqùèst rètùrns thè còntènt òf nòtès, rècòrdèd èvènts, ànd càlls, ànd wìthhòlds thè bòdy òf èvèry òrdìnàry mèssàgè. Èxpàndìng à clùstèr fètchès thòsè bòdìès by ìdèntìfìèr. Rèvìèwìng à lòng tìckèt còsts ònè smàll rèqùèst ràthèr thàn dècryptìng èvèry mèssàgè tò dràw thè ìndèx. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè ìndèx rèpòrt àbòùt mèdìà? ••••••••••••** Whèthèr à fòllòw-ùp càrrìès à rècòrdìng, àn ìmàgè, òr à fìlè, ànd thè lòngèst rècòrdìng's dùràtìòn. Thè sèrvèr ànswèrs àll òf thàt fròm thè ròws bèsìdè thè fòllòw-ùp ràthèr thàn fròm ànythìng ìt òpènèd. À dàtàbàsè dùmp rèvèàls thè sàmè shàpè: hòw màny fòllòw-ùps à tìckèt hàs, whèn èàch àrrìvèd, whìch càrrìèd àn àttàchmènt, ànd hòw lòng à rècòrdìng ràn. [Phòtòs ànd MMS](#tìckèt-dètàìl/mèdìà-ìmàgès) còvèrs thè fìlès thèmsèlvès. [[#sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè tìmèlìnè shàrè wìth thè thrèàd? ••••••••••••••** Thè sàmè fìltèrs àpply, ànd thè sàmè ròlè rèstrìctìòn òn nòtè typès, sò à fòllòw-ùp àbsènt fròm thè thrèàd ìs àbsènt hèrè. Sèàrchìng ìn thìs vìèw màtchès ònly thè fòllòw-ùps whòsè còntènt thè ìndèx càrrìès. [Fìltèrìng à cònvèrsàtìòn](#tìckèt-dètàìl/thrèàd-fìltèrs) còvèrs thè nàrròwìng, ànd [Ìn thrèàd sèàrch](#tìckèt-dètàìl/dèèp-sèàrch) còvèrs thàt dìffèrèncè. [[#pèrmìssìòns #fàìlùrè-stàtès]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè ìndèx èndpòìnt ànd ìts còmpònènt. ••••••••••••** \`lìstFòllòwÙpSùmmàry\` ìn \`pàckàgès/sèrvèr/src/ròùtès/tìckèts.ts\` dèfàùlts tò fìvè hùndrèd fòllòw-ùps ànd àccèpts twò thòùsànd; thè wìthhòldìng rùlè ìs \`lìstSùmmàry\` ìn \`pàckàgès/sèrvèr/src/tìckèts/fòllòwùp-sèrvìcè.ts\`. Thè vìèw ìs \`FòllòwÙpTìmèlìnè.svèltè\`; ìts làndmàrk ànd clùstèr shàpès àrè ìn \`fòllòw-ùp-tìmèlìnè-typès.ts\`. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
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