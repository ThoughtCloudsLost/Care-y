/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Outbound_Edit_BodyInputs */

const en_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A message already sent on the client's encrypted channel can be corrected. The correction replaces both the follow-up row and the client's portal copy. [[#encryption #client-data]]
**What can be edited?** Only a message the signed-in account wrote on the encrypted channel. The server refuses a text, a message written by the client, an internal note, and a follow-up whose key has not yet converged onto the ticket key. Sending on that channel and editing what was sent both require the Message clients in portal permission. [Conversation thread](#ticket-detail/conversation) covers convergence. [[#permissions #keys]]
**What does a save write?** The browser seals the new text under the ticket key at the same slot the original used, so the follow-up keeps its position in the ticket. Where the client has an active portal channel, the copy sealed for that channel is replaced in the same transaction. A message sent before the client had a channel has no portal copy, and an edit creates none. [[#encryption #portal]]
**What does the row keep?** The row records an edited timestamp, so the ticket shows that a follow-up was changed and when. The previous text is replaced, with no earlier version kept. The client's own thread shows the corrected text rather than a history. [[#metadata #server-holds]]
**What happens when a save fails?** The sheet reports a generic failure and discards the error, because an error thrown on the encrypt path can carry the message text. Nothing is written when either copy fails; the follow-up row and the portal copy are updated in one transaction. [[#failure-states #privacy]]
**The edit sheet and the service guards.** \`OutboundMessageEditSheet.svelte\` seals the new text and calls \`updateOutboundMessage\`, whose guards are in \`packages/server/src/tickets/followup-service.ts\`. The client copy is a \`portal_messages\` row from \`090_portal_channels.ts\`. The length cap is 5,000 characters, enforced in the sheet only; the server validates the ciphertext size but cannot check plaintext length without decryption. [[#client-data]]`)
};

const es_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un mensaje ya enviado en el canal cifrado del cliente se puede corregir. La corrección reemplaza tanto la fila del seguimiento como la copia en el portal del cliente. [[#encryption #client-data]]
**¿Qué se puede editar?** Solo un mensaje que la cuenta que ha iniciado sesión escribió en el canal cifrado. El servidor rechaza un texto, un mensaje escrito por el cliente, una nota interna y un seguimiento cuya clave aún no ha convergido con la clave del ticket. Enviar en ese canal y editar lo enviado requieren el permiso Enviar mensajes en el portal. [Hilo de conversación](#ticket-detail/conversation) trata la convergencia. [[#permissions #keys]]
**¿Qué escribe un guardado?** El navegador sella el nuevo texto con la clave del ticket en la misma ranura que usó el original, así que el seguimiento conserva su posición en el ticket. Cuando el cliente tiene un canal de portal activo, la copia sellada para ese canal se reemplaza en la misma transacción. Un mensaje enviado antes de que el cliente tuviera canal no tiene copia en el portal, y una edición no la crea. [[#encryption #portal]]
**¿Qué conserva la fila?** La fila registra una marca de tiempo de edición, así que el ticket muestra que un seguimiento fue modificado y cuándo. El texto anterior se reemplaza sin conservar ninguna versión previa. El hilo propio del cliente muestra el texto corregido en lugar de un historial. [[#metadata #server-holds]]
**¿Qué ocurre cuando un guardado falla?** La hoja reporta un fallo genérico y descarta el error, porque un error lanzado en la ruta de cifrado puede llevar el texto del mensaje. Nada se escribe cuando cualquiera de las dos copias falla; la fila del seguimiento y la copia en el portal se actualizan en una sola transacción. [[#failure-states #privacy]]
**La hoja de edición y las guardas del servicio.** \`OutboundMessageEditSheet.svelte\` sella el nuevo texto y llama a \`updateOutboundMessage\`, cuyas guardas están en \`packages/server/src/tickets/followup-service.ts\`. La copia del cliente es una fila de \`portal_messages\` de \`090_portal_channels.ts\`. El límite de longitud es 5.000 caracteres, aplicado solo en la hoja; el servidor valida el tamaño del texto cifrado pero no puede verificar la longitud del texto plano sin descifrarlo. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À mèssàgè àlrèàdy sènt òn thè clìènt's èncryptèd chànnèl càn bè còrrèctèd. Thè còrrèctìòn rèplàcès bòth thè fòllòw-ùp ròw ànd thè clìènt's pòrtàl còpy. [[#èncryptìòn #clìènt-dàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt càn bè èdìtèd? ••••••** Ònly à mèssàgè thè sìgnèd-ìn àccòùnt wròtè òn thè èncryptèd chànnèl. Thè sèrvèr rèfùsès à tèxt, à mèssàgè wrìttèn by thè clìènt, àn ìntèrnàl nòtè, ànd à fòllòw-ùp whòsè kèy hàs nòt yèt cònvèrgèd òntò thè tìckèt kèy. Sèndìng òn thàt chànnèl ànd èdìtìng whàt wàs sènt bòth rèqùìrè thè Mèssàgè clìènts ìn pòrtàl pèrmìssìòn. [Cònvèrsàtìòn thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) còvèrs cònvèrgèncè. [[#pèrmìssìòns #kèys]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à sàvè wrìtè? •••••••** Thè bròwsèr sèàls thè nèw tèxt ùndèr thè tìckèt kèy àt thè sàmè slòt thè òrìgìnàl ùsèd, sò thè fòllòw-ùp kèèps ìts pòsìtìòn ìn thè tìckèt. Whèrè thè clìènt hàs àn àctìvè pòrtàl chànnèl, thè còpy sèàlèd fòr thàt chànnèl ìs rèplàcèd ìn thè sàmè trànsàctìòn. À mèssàgè sènt bèfòrè thè clìènt hàd à chànnèl hàs nò pòrtàl còpy, ànd àn èdìt crèàtès nònè. [[#èncryptìòn #pòrtàl]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè ròw kèèp? •••••••** Thè ròw rècòrds àn èdìtèd tìmèstàmp, sò thè tìckèt shòws thàt à fòllòw-ùp wàs chàngèd ànd whèn. Thè prèvìòùs tèxt ìs rèplàcèd, wìth nò èàrlìèr vèrsìòn kèpt. Thè clìènt's òwn thrèàd shòws thè còrrèctèd tèxt ràthèr thàn à hìstòry. [[#mètàdàtà #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt hàppèns whèn à sàvè fàìls? ••••••••••** Thè shèèt rèpòrts à gènèrìc fàìlùrè ànd dìscàrds thè èrròr, bècàùsè àn èrròr thròwn òn thè èncrypt pàth càn càrry thè mèssàgè tèxt. Nòthìng ìs wrìttèn whèn èìthèr còpy fàìls; thè fòllòw-ùp ròw ànd thè pòrtàl còpy àrè ùpdàtèd ìn ònè trànsàctìòn. [[#fàìlùrè-stàtès #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè èdìt shèèt ànd thè sèrvìcè gùàrds. ••••••••••••** \`ÒùtbòùndMèssàgèÈdìtShèèt.svèltè\` sèàls thè nèw tèxt ànd càlls \`ùpdàtèÒùtbòùndMèssàgè\`, whòsè gùàrds àrè ìn \`pàckàgès/sèrvèr/src/tìckèts/fòllòwùp-sèrvìcè.ts\`. Thè clìènt còpy ìs à \`pòrtàl_mèssàgès\` ròw fròm \`090_pòrtàl_chànnèls.ts\`. Thè lèngth càp ìs 5,000 chàràctèrs, ènfòrcèd ìn thè shèèt ònly; thè sèrvèr vàlìdàtès thè cìphèrtèxt sìzè bùt cànnòt chèck plàìntèxt lèngth wìthòùt dècryptìòn. [[#clìènt-dàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A message already sent on the client's encrypted channel can be corrected. The correction replaces both the follow-up row and the client's portal copy. [[#en..." |
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