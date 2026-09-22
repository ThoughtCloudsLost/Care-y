/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Outbound_Edit_BodyInputs */

const en_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A message already sent on the client's encrypted channel can be corrected, and the correction replaces both copies of it. [[#encryption #client-data]]
**What can be edited.** A message the signed-in account wrote on the encrypted channel, and nothing else. A text, a message written by the client, and an internal note are each refused by the server rather than by the menu, and so is a message whose key has not yet converged onto the case key, because its sealing assumptions differ. Sending on that channel and editing what was sent are the same permission. [The conversation thread](#ticket-detail/conversation) covers convergence. [[#permissions #keys]]
**What a save writes.** The new text is sealed in the browser under the case key at the same slot the original used, so the entry keeps its binding to its own place in the case, and the copy sealed for the client's channel is replaced in the same transaction where one exists. A message sent before the client had a channel has no second copy, and none is created by an edit. [[#encryption #portal]]
**What the record keeps.** The row keeps an edited time, so the case shows that a message was changed and when, and the previous text is replaced with no earlier version kept. The client's own thread shows the corrected text, not a history. [[#metadata #server-holds]]
**When a save fails.** The sheet reports a generic failure and discards the error, because an error thrown on the encrypt path can carry the message text. Nothing is written when either copy fails, since the row and the client copy are updated together. [[#failure-states #privacy]]
**The edit path and the guards.** \`OutboundMessageEditSheet.svelte\` seals the new text and calls \`updateOutboundMessage\`, whose guards are in \`packages/server/src/tickets/followup-service.ts\`, and the client copy lives in the \`portal_messages\` row from \`090_portal_channels.ts\`. The length cap is 5,000 characters, enforced in the sheet. [[#client-data]]`)
};

const es_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un mensaje ya enviado por el canal cifrado del cliente se puede corregir, y la corrección reemplaza ambas copias. [[#encryption #client-data]]
**Qué se puede editar.** Un mensaje que escribió la cuenta con la sesión iniciada por el canal cifrado, y nada más. Un mensaje de texto, un mensaje escrito por el cliente y una nota interna los rechaza el servidor y no el menú, igual que un mensaje cuya clave aún no ha convergido en la del caso, porque sus supuestos de sellado son distintos. Enviar por ese canal y editar lo enviado son el mismo permiso. [El hilo de conversación](#ticket-detail/conversation) trata la convergencia. [[#permissions #keys]]
**Lo que escribe un guardado.** El texto nuevo se sella en el navegador con la clave del caso en la misma ranura que usó el original, de modo que la entrada conserva su ligadura a su propio lugar en el caso, y la copia sellada para el canal del cliente se reemplaza en la misma transacción allí donde existe. Un mensaje enviado antes de que el cliente tuviera canal no tiene segunda copia, y una edición no la crea. [[#encryption #portal]]
**Lo que conserva el registro.** La fila conserva una fecha de edición, así que el caso muestra que un mensaje cambió y cuándo, y el texto anterior se reemplaza sin conservar ninguna versión previa. El hilo propio del cliente muestra el texto corregido, no un historial. [[#metadata #server-holds]]
**Cuando un guardado falla.** La hoja informa de un fallo genérico y descarta el error, porque un error lanzado en el camino de cifrado puede llevar el texto del mensaje. No se escribe nada si falla cualquiera de las dos copias, ya que la fila y la copia del cliente se actualizan juntas. [[#failure-states #privacy]]
**El camino de edición y sus guardas.** \`OutboundMessageEditSheet.svelte\` sella el texto nuevo y llama a \`updateOutboundMessage\`, cuyas guardas están en \`packages/server/src/tickets/followup-service.ts\`, y la copia del cliente vive en la fila de \`portal_messages\` de \`090_portal_channels.ts\`. El tope de longitud es de 5.000 caracteres y se aplica en la hoja. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs càn èdìt àn òùtbòùnd ìn-àpp mèssàgè àftèr sèndìng ìt by òpènìng thè mèssàgè's àctìòn mènù ànd sèlèctìng èdìt. Thè èdìt shèèt òpèns wìth thè dècryptèd còntènt prèfìllèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Chàràctèr còùntèr. ••••••** À chàràctèr lìmìt àpplìès tò èdìtèd mèssàgès. À còùntèr àppèàrs nèàr thè càp ànd tùrns rèd whèn thè lìmìt ìs rèàchèd.
 ••••••••••••••••••••••••••••••••••••**Rè-èncryptìòn. •••••** Sàvìng àn èdìt rè-èncrypts thè mèssàgè ìn thè bròwsèr ùsìng thè sàmè tìckèt kèy. Whèn à pòrtàl chànnèl ìs àctìvè, thè ùpdàtè ìs àlsò èncryptèd tò thè clìènt's pùblìc kèy sò thè còrrèctèd vèrsìòn ìs rèàdàblè òn thè clìènt sìdè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Scòpè. ••** Ònly ìn-àpp òùtbòùnd mèssàgès àùthòrèd by thè cùrrènt vòlùntèèr càn bè èdìtèd. SMS mèssàgès, clìènt mèssàgès, ànd ìntèrnàl nòtès àrè nòt èdìtàblè fròm thìs shèèt. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A message already sent on the client's encrypted channel can be corrected, and the correction replaces both copies of it. [[#encryption #client-data]] **What..." |
*
* @param {Demo_Narrative_Topic_Outbound_Edit_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_outbound_edit_body = /** @type {((inputs?: Demo_Narrative_Topic_Outbound_Edit_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Outbound_Edit_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_outbound_edit_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_outbound_edit_body(inputs)
	return en_demo_narrative_topic_outbound_edit_body(inputs)
});