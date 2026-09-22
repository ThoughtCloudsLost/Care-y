/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Conversation_BodyInputs */

const en_demo_narrative_topic_conversation_body = /** @type {(inputs: Demo_Narrative_Topic_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case thread carries everything said on the case in one sequence: what the client sent, what the organization sent back, the notes written about it, and the events the case recorded. [[#client-data]]
**One sequence, several channels.** A text message, a reply typed into the application, an email and a voicemail are separate kinds of entry in the same thread, and which side an entry sits on is decided by whether the client or a user wrote it. The kind is a plaintext column, so the server knows a case received four texts and sent one email at given times, and holds the words of none of them. [The telephony relay](#deep-dive/the-telephony-relay) covers what the carrier saw of a text before it arrived. [[#metadata #server-holds #telephony]]
**How the entries are sealed.** Each one is sealed individually with the case key and bound to its own slot, so a ciphertext moved to another entry or another case fails to open rather than opening in the wrong place. Replies a client sends from their portal arrive under a one-off key that is unwrapped and converged into the case key on first reading. [How encryption works](#deep-dive/how-encryption-works) covers the slot binding. [[#encryption #keys]]
**Reading backwards through a long case.** The thread opens on the most recent fifty entries and fetches older pages of fifty as reading moves back, holding the reading position steady as each page is added. With unread entries further back than the first page, pages are fetched until the last read point is in view. A refresh of the newest page merges by entry rather than replacing the page, so an older page already loaded is not torn at its edge. [[#failure-states]]
**The paginator and the row.** \`packages/client/src/lib/tickets/chat-paginator.svelte.ts\` is the shared paging implementation behind both this thread and the client's own view of it, which is why the two cannot drift. The row is \`026_create_followups.ts\` with the content as bytea beside a plaintext source, kind and timestamp. [Date separators](#ticket-detail/date-separators) covers the day boundaries, and [System events](#ticket-detail/system-events) covers the recorded events. [[#client-data #server-holds]]`)
};

const es_demo_narrative_topic_conversation_body = /** @type {(inputs: Demo_Narrative_Topic_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El hilo del caso lleva en una sola secuencia todo lo dicho en él: lo que envió el cliente, lo que la organización respondió, las notas escritas sobre él y los eventos que el caso registró. [[#client-data]]
**Una secuencia, varios canales.** Un mensaje de texto, una respuesta escrita en la aplicación, un correo y un mensaje de voz son tipos distintos de entrada en el mismo hilo, y de qué lado queda una entrada lo decide si la escribió el cliente o una persona usuaria. El tipo es una columna en texto plano, de modo que el servidor sabe que un caso recibió cuatro mensajes de texto y envió un correo en ciertas fechas, y no guarda las palabras de ninguno. [El relé de telefonía](#deep-dive/the-telephony-relay) trata lo que vio la operadora de un mensaje de texto antes de que llegara. [[#metadata #server-holds #telephony]]
**Cómo se sellan las entradas.** Cada una se sella por separado con la clave del caso y queda ligada a su propia ranura, así que un texto cifrado trasladado a otra entrada o a otro caso no se abre en lugar de abrirse en el sitio equivocado. Las respuestas que un cliente envía desde su portal llegan con una clave de un solo uso que se desenvuelve y converge en la clave del caso en la primera lectura. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata esa ligadura por ranura. [[#encryption #keys]]
**Leer hacia atrás en un caso largo.** El hilo se abre con las cincuenta entradas más recientes y trae páginas anteriores de cincuenta a medida que la lectura retrocede, manteniendo firme la posición de lectura cada vez que se añade una página. Si hay entradas sin leer más atrás que la primera página, se traen páginas hasta que el último punto leído queda a la vista. Una actualización de la página más reciente se combina por entrada en lugar de reemplazar la página, de modo que una página anterior ya cargada no se rompe por su borde. [[#failure-states]]
**El paginador y la fila.** \`packages/client/src/lib/tickets/chat-paginator.svelte.ts\` es la paginación compartida que hay detrás tanto de este hilo como de la vista que el cliente tiene de él, y por eso los dos no pueden separarse. La fila es \`026_create_followups.ts\`, con el contenido en bytea junto a un origen, un tipo y una fecha en texto plano. [Separadores de fecha](#ticket-detail/date-separators) trata los límites entre días, y [Eventos del sistema](#ticket-detail/system-events) trata los eventos registrados. [[#client-data #server-holds]]`)
};

const en_xa2_demo_narrative_topic_conversation_body = /** @type {(inputs: Demo_Narrative_Topic_Conversation_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè màìn bòdy òf thè tìckèt dètàìl ìs à cònvèrsàtìòn thrèàd shòwìng mèssàgès bètwèèn thè vòlùntèèr ànd thè clìènt.
 •••••••••••••••••••••••••••••••••••**Dècryptìòn. ••••** Èàch mèssàgè ìs ìndìvìdùàlly èncryptèd wìth thè pèr tìckèt kèy ùsìng XChàChà20-Pòly1305. Thè bròwsèr dècrypts thèm lòcàlly ànd thè sèrvèr nèvèr sèès thè plàìntèxt còntènt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••**Chànnèls. •••** Mèssàgès mày àrrìvè vìà dìffèrènt chànnèls. Àn SMS mèssàgè fròm thè clìènt ànd à wèb rèply fròm thè vòlùntèèr àppèàr ìn thè sàmè thrèàd. Thè chànnèl ìndìcàtòr òn èàch mèssàgè shòws hòw ìt wàs sènt. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The case thread carries everything said on the case in one sequence: what the client sent, what the organization sent back, the notes written about it, and t..." |
*
* @param {Demo_Narrative_Topic_Conversation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_conversation_body = /** @type {((inputs?: Demo_Narrative_Topic_Conversation_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Conversation_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_conversation_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_conversation_body(inputs)
	return en_demo_narrative_topic_conversation_body(inputs)
});