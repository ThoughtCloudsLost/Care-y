/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Outbound_Edit_BodyInputs */

const en_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can edit an outbound in-app message after sending it by opening the message's action menu and selecting edit. The edit sheet opens with the decrypted content prefilled.
**Character counter.** A character limit applies to edited messages. A counter appears near the cap and turns red when the limit is reached.
**Re-encryption.** Saving an edit re-encrypts the message in the browser using the same ticket key. When a portal channel is active, the update is also encrypted to the client's public key so the corrected version is readable on the client side.
**Scope.** Only in-app outbound messages authored by the current volunteer can be edited. SMS messages, client messages, and internal notes are not editable from this sheet.`)
};

const es_demo_narrative_topic_outbound_edit_body = /** @type {(inputs: Demo_Narrative_Topic_Outbound_Edit_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden editar un mensaje saliente en la aplicación después de enviarlo abriendo el menú de acciones del mensaje y seleccionando editar. La hoja de edición se abre con el contenido descifrado prellenado.
**Contador de caracteres.** Se aplica un límite de caracteres a los mensajes editados. Un contador aparece cerca del máximo y se pone rojo cuando se alcanza el límite.
**Re-cifrado.** Guardar una edición re-cifra el mensaje en el navegador usando la misma clave del ticket. Cuando hay un canal del portal activo, la actualización también se cifra con la clave pública del cliente para que la versión corregida sea legible del lado del cliente.
**Alcance.** Solo los mensajes salientes en la aplicación escritos por el voluntario actual pueden editarse. Los mensajes SMS, mensajes de clientes y notas internas no son editables desde esta hoja.`)
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
* | "Volunteers can edit an outbound in-app message after sending it by opening the message's action menu and selecting edit. The edit sheet opens with the decryp..." |
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