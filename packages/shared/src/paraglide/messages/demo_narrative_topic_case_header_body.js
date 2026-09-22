/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Header_BodyInputs */

const en_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The case header reports the title, the priority, whether the case is closed, and a field list holding the description, the queue, who holds the case and how long ago it was opened. [[#client-data]]
**What the browser opens here.** The title and the description are sealed with the case's own key. The queue name and the other user's display name are organization-key ciphertext. The priority, the status and the opened time are plaintext columns, so a database dump shows how urgent someone judged this case, whether it is still open and when it arrived, and none of the words in it. [How encryption works](#deep-dive/how-encryption-works) covers the two key tiers. [[#encryption #server-holds #metadata]]
**When the title cannot be opened.** An account in the queue whose copy of the case key was never wrapped for it still gets the row, with a placeholder standing in for the title and the description while the queue, the priority, the status and the opened time read normally. [Ticket decryption](#tickets/decryption) covers how the key reaches an account. [[#keys #failure-states]]
**What the header leaves out.** The client's phone number and email address are absent from it. Both are held under the server's operational key rather than the case key, and what a caller receives of them is decided per request, which is why they live in the case panel. [The case panel](#ticket-detail/case-panel) covers that decision. [[#privacy #trust-boundary]]
**The header component and its queries.** \`packages/client/src/lib/components/tickets/CaseHeader.svelte\` reads \`tickets.get\` under the same query key the thread uses, so the two never disagree, and takes the queue color and icon from the shared queue list rather than the case payload. A description that decrypts to an empty string leaves its row out. [[#client-data]]`)
};

const es_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El encabezado del caso indica el título, la prioridad, si el caso está cerrado y una lista de campos con la descripción, la cola, quién lleva el caso y cuánto hace que se abrió. [[#client-data]]
**Lo que el navegador abre aquí.** El título y la descripción están sellados con la clave propia del caso. El nombre de la cola y el nombre visible de la otra persona son texto cifrado con la clave de la organización. La prioridad, el estado y la fecha de apertura son columnas en texto plano, de modo que un volcado de la base de datos muestra con qué urgencia se juzgó este caso, si sigue abierto y cuándo llegó, y ninguna de sus palabras. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata los dos niveles de claves. [[#encryption #server-holds #metadata]]
**Cuando el título no se puede abrir.** Una cuenta de la cola para la que nunca se envolvió la clave del caso recibe igualmente la fila, con un marcador en lugar del título y la descripción, mientras la cola, la prioridad, el estado y la fecha de apertura se leen con normalidad. [Descifrado de tickets](#tickets/decryption) trata cómo llega la clave a una cuenta. [[#keys #failure-states]]
**Lo que el encabezado no trae.** El número de teléfono y la dirección de correo del cliente no están en él. Ambos se guardan bajo la clave operativa del servidor y no bajo la clave del caso, y lo que recibe de ellos quien consulta se decide en cada petición, por lo que viven en el panel del caso. [El panel del caso](#ticket-detail/case-panel) trata esa decisión. [[#privacy #trust-boundary]]
**El componente del encabezado y sus consultas.** \`packages/client/src/lib/components/tickets/CaseHeader.svelte\` lee \`tickets.get\` bajo la misma clave de consulta que usa el hilo, así que los dos nunca discrepan, y toma el color y el icono de la cola de la lista compartida de colas y no de los datos del caso. Una descripción que se descifra como cadena vacía deja fuera su fila. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_case_header_body = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè hèàdèr àt thè tòp òf thè tìckèt shòws thè tìtlè, cùrrènt stàtùs, prìòrìty, àssìgnèd vòlùntèèr, ànd qùèùè.
 •••••••••••••••••••••••••••••••••**Èncryptìòn by fìèld. ••••••** Tìtlè ànd dèscrìptìòn àrè èncryptèd wìth thè pèr tìckèt kèy. Qùèùè nàmè ànd àssìgnèè dìsplày nàmè àrè èncryptèd wìth thè òrgànìzàtìòn kèy. Prìòrìty, stàtùs, ànd tìmèstàmps àrè plàìntèxt mètàdàtà thè sèrvèr ùsès fòr sòrtìng ànd fìltèrìng.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Clìènt phònè. ••••** Thè clìènt phònè nùmbèr ìs ròlè màskèd by thè sèrvèr. Àdmìnìstràtòrs sèè thè fùll nùmbèr, mànàgèrs ànd thè àssìgnèd vòlùntèèr sèè thè làst fòùr dìgìts, ànd ùnàssìgnèd vòlùntèèrs sèè nòthìng.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èdìtìng. •••** Stàtùs, prìòrìty, àssìgnèè, ànd qùèùè àrè chàngèd fròm thè càsè pànèl, òpènèd fròm thè clìènt àlìàs òr thè càsè bùttòn ìn thè nàvìgàtìòn bàr, ànd thè pànèl àlsò pròvìdès hòld, àssìgn, clòsè, ànd rèòpèn àctìòns. Chàngès àrè èncryptèd ìn thè bròwsèr bèfòrè bèìng sènt tò thè sèrvèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The case header reports the title, the priority, whether the case is closed, and a field list holding the description, the queue, who holds the case and how ..." |
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