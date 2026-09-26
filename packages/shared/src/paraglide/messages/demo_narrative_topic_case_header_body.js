/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Header_BodyInputs */

const en_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case header reports the ticket's title, the priority, whether the ticket is closed, the description, the queue, who holds the ticket and how long ago it was opened. The header names the signed-in account when the ticket is assigned to it, and reads unassigned when nobody holds it. [The full case record](#ticket-detail/case-panel) covers the fields the header does not carry. [[#client-data]]
**What does the browser open here?** The title and the description are sealed with the ticket's own key. The queue name and the assignee's display name are encrypted with the organization key. Priority, status and the opened time are plaintext columns. A database dump shows the ticket's priority, whether it is still open and when it arrived. It does not show any of the words in the ticket. [How encryption works](#deep-dive/how-encryption-works) covers the two key tiers. [[#encryption #server-holds #metadata]]
**What happens when the title cannot be opened?** An account in the queue that never received a wrapped copy of the ticket key still gets the row. The title carries a failure message in its place. The queue, priority, status and opened time read normally. [Ticket decryption](#tickets/decryption) covers how the key reaches an account. [[#keys #failure-states]]
**The header component and its queries.** \`packages/client/src/lib/components/tickets/CaseHeader.svelte\` reads \`tickets.get\` under \`ticketKeys.detail(ticketId)\`, the same query key the thread uses, which keeps the header and the thread in sync. The ticket payload carries only the encrypted queue name. The queue color and icon come from the shared queue list instead. [[#client-data]]`)
};

const es_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El encabezado del caso indica el título del ticket, la prioridad, si el ticket está cerrado, la descripción, la cola, quién lleva el ticket y cuánto hace que se abrió. El encabezado nombra a la cuenta que ha iniciado sesión cuando el ticket está asignado a ella, e indica sin asignar cuando nadie lo lleva. [El expediente completo](#ticket-detail/case-panel) trata los campos que el encabezado no lleva. [[#client-data]]
**¿Qué abre el navegador aquí?** El título y la descripción están sellados con la clave propia del ticket. El nombre de la cola y el nombre visible de la persona asignada están cifrados con la clave de la organización. La prioridad, el estado y la fecha de apertura son columnas en texto plano. Un volcado de la base de datos muestra la prioridad del ticket, si sigue abierto y cuándo llegó. No muestra ninguna de las palabras del ticket. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los dos niveles de claves. [[#encryption #server-holds #metadata]]
**¿Qué pasa cuando el título no se puede abrir?** Una cuenta de la cola que nunca recibió una copia envuelta de la clave del ticket recibe igualmente la fila. El título lleva un mensaje de error en su lugar. La cola, la prioridad, el estado y la fecha de apertura se leen con normalidad. [Descifrado de tickets](#tickets/decryption) trata cómo llega la clave a una cuenta. [[#keys #failure-states]]
**El componente del encabezado y sus consultas.** \`packages/client/src/lib/components/tickets/CaseHeader.svelte\` lee \`tickets.get\` bajo \`ticketKeys.detail(ticketId)\`, la misma clave de consulta que usa el hilo, lo que mantiene el encabezado y el hilo sincronizados. Los datos del ticket solo llevan el nombre cifrado de la cola. El color y el icono de la cola provienen de la lista compartida de colas. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè càsè hèàdèr rèpòrts thè tìckèt's tìtlè, thè prìòrìty, whèthèr thè tìckèt ìs clòsèd, thè dèscrìptìòn, thè qùèùè, whò hòlds thè tìckèt ànd hòw lòng àgò ìt wàs òpènèd. Thè hèàdèr nàmès thè sìgnèd-ìn àccòùnt whèn thè tìckèt ìs àssìgnèd tò ìt, ànd rèàds ùnàssìgnèd whèn nòbòdy hòlds ìt. [Thè fùll càsè rècòrd](#tìckèt-dètàìl/càsè-pànèl) còvèrs thè fìèlds thè hèàdèr dòès nòt càrry. [[#clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè bròwsèr òpèn hèrè? ••••••••••** Thè tìtlè ànd thè dèscrìptìòn àrè sèàlèd wìth thè tìckèt's òwn kèy. Thè qùèùè nàmè ànd thè àssìgnèè's dìsplày nàmè àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Prìòrìty, stàtùs ànd thè òpènèd tìmè àrè plàìntèxt còlùmns. À dàtàbàsè dùmp shòws thè tìckèt's prìòrìty, whèthèr ìt ìs stìll òpèn ànd whèn ìt àrrìvèd. Ìt dòès nòt shòw àny òf thè wòrds ìn thè tìckèt. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè twò kèy tìèrs. [[#èncryptìòn #sèrvèr-hòlds #mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn thè tìtlè cànnòt bè òpènèd? ••••••••••••••** Àn àccòùnt ìn thè qùèùè thàt nèvèr rècèìvèd à wràppèd còpy òf thè tìckèt kèy stìll gèts thè ròw. Thè tìtlè càrrìès à fàìlùrè mèssàgè ìn ìts plàcè. Thè qùèùè, prìòrìty, stàtùs ànd òpènèd tìmè rèàd nòrmàlly. [Tìckèt dècryptìòn](#tìckèts/dècryptìòn) còvèrs hòw thè kèy rèàchès àn àccòùnt. [[#kèys #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè hèàdèr còmpònènt ànd ìts qùèrìès. ••••••••••••** \`pàckàgès/clìènt/src/lìb/còmpònènts/tìckèts/CàsèHèàdèr.svèltè\` rèàds \`tìckèts.gèt\` ùndèr \`tìckètKèys.dètàìl(tìckètÌd)\`, thè sàmè qùèry kèy thè thrèàd ùsès, whìch kèèps thè hèàdèr ànd thè thrèàd ìn sync. Thè tìckèt pàylòàd càrrìès ònly thè èncryptèd qùèùè nàmè. Thè qùèùè còlòr ànd ìcòn còmè fròm thè shàrèd qùèùè lìst ìnstèàd. [[#clìènt-dàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The case header reports the ticket's title, the priority, whether the ticket is closed, the description, the queue, who holds the ticket and how long ago it ..." |
*
* @param {Demo_Narrative_Topic_Case_Header_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_header_body = /** @type {((inputs?: Demo_Narrative_Topic_Case_Header_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Header_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_header_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_header_body(inputs)
	return en_demo_narrative_topic_case_header_body(inputs)
});