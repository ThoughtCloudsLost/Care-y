/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Actions_BodyInputs */

const en_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tapping and holding a message opens a context menu with actions for that specific message.
**Available actions.** Copy, edit, and delete are available. Edit and delete on internal notes are restricted to the note's author, and administrators can delete other volunteers' notes but cannot edit them. Outbound in app messages authored by the current volunteer can also be edited from this menu.
**Copy.** Copies the decrypted message text to the clipboard. The copied text stays on the device.
**Client messages.** Messages from clients support copy only, since the volunteer cannot alter content the client sent.`)
};

const es_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mantener pulsado un mensaje abre un menú contextual con acciones para ese mensaje específico.
**Acciones disponibles.** Copiar, editar y eliminar están disponibles. Editar y eliminar en notas internas están restringidos al autor de la nota, y los administradores pueden eliminar notas de otros voluntarios pero no pueden editarlas. Los mensajes salientes en la aplicación escritos por el voluntario actual también pueden editarse desde este menú.
**Copiar.** Copia el texto descifrado del mensaje al portapapeles. El texto copiado permanece en el dispositivo.
**Mensajes del cliente.** Los mensajes de clientes solo admiten copiar, ya que el voluntario no puede alterar contenido enviado por el cliente.`)
};

const en_xa2_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàppìng ànd hòldìng à mèssàgè òpèns à còntèxt mènù wìth àctìòns fòr thàt spècìfìc mèssàgè.
 ••••••••••••••••••••••••••••**Àvàìlàblè àctìòns. ••••••** Còpy, èdìt, ànd dèlètè àrè àvàìlàblè. Èdìt ànd dèlètè òn ìntèrnàl nòtès àrè rèstrìctèd tò thè nòtè's àùthòr, ànd àdmìnìstràtòrs càn dèlètè òthèr vòlùntèèrs' nòtès bùt cànnòt èdìt thèm. Òùtbòùnd ìn àpp mèssàgès àùthòrèd by thè cùrrènt vòlùntèèr càn àlsò bè èdìtèd fròm thìs mènù.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còpy. ••** Còpìès thè dècryptèd mèssàgè tèxt tò thè clìpbòàrd. Thè còpìèd tèxt stàys òn thè dèvìcè.
 •••••••••••••••••••••••••••**Clìènt mèssàgès. •••••** Mèssàgès fròm clìènts sùppòrt còpy ònly, sìncè thè vòlùntèèr cànnòt àltèr còntènt thè clìènt sènt. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tapping and holding a message opens a context menu with actions for that specific message. **Available actions.** Copy, edit, and delete are available. Edit ..." |
*
* @param {Demo_Narrative_Topic_Message_Actions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_message_actions_body = /** @type {((inputs?: Demo_Narrative_Topic_Message_Actions_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Message_Actions_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_message_actions_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_message_actions_body(inputs)
	return en_demo_narrative_topic_message_actions_body(inputs)
});