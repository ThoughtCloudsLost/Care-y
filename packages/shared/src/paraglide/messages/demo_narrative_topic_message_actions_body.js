/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Message_Actions_BodyInputs */

const en_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Holding an entry in the thread offers the actions that entry allows, which depend on what kind it is and who wrote it. [[#permissions #client-data]]
**What is offered on what.** Copying is offered on every entry whose text the browser has opened. Editing is offered on a message the signed-in account sent on the client's encrypted channel and on an internal note it wrote. Deleting is offered on an internal note, to the account that wrote it and to an administrator, who may remove another account's note without being able to change its words. [Internal notes](#ticket-detail/notes) covers the note rules, and [Editing a sent message](#ticket-detail/outbound-edit) covers what an edit replaces. [[#permissions]]
**Why the menu is not the control.** The same rules are checked again on the server for each edit or delete request, against the account making it, so an entry offered by mistake still cannot be changed. [The permission system](#deep-dive/the-permission-system) covers where those checks come from. [[#permissions #trust-boundary]]
**What a copy takes with it.** The decrypted text of one entry, onto the device clipboard, which the application does not control once it is there. [Selecting messages](#ticket-detail/message-select) covers the same limit for several entries at once. [[#privacy]]
**What a delete leaves behind.** The entry is marked deleted and excluded from every later read, and its ciphertext stays in the row until retention removes it. Nothing about a deletion reaches the client's own thread. [Data retention](#deep-dive/data-retention) covers the removal. [[#retention #server-holds]]
**The eligibility function.** \`context-menu-actions.ts\` in \`packages/client/src/lib/components/tickets/\` decides which actions an entry offers from its type, its source and its author, and \`create-context-menu.svelte.ts\` dispatches the chosen one. The server-side guards are \`updateFollowUp\` and \`softDeleteInternalNote\` in \`packages/server/src/tickets/followup-service.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_message_actions_body = /** @type {(inputs: Demo_Narrative_Topic_Message_Actions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mantener pulsada una entrada del hilo ofrece las acciones que esa entrada admite, que dependen de su tipo y de quién la escribió. [[#permissions #client-data]]
**Qué se ofrece sobre qué.** Copiar se ofrece en toda entrada cuyo texto haya abierto el navegador. Editar se ofrece en un mensaje que la cuenta con la sesión iniciada envió por el canal cifrado del cliente y en una nota interna que escribió ella misma. Borrar se ofrece en una nota interna, a la cuenta que la escribió y a una persona administradora, que puede retirar la nota de otra cuenta sin poder cambiar sus palabras. [Notas internas](#ticket-detail/notes) trata las reglas de las notas, y [Editar un mensaje enviado](#ticket-detail/outbound-edit) trata lo que reemplaza una edición. [[#permissions]]
**Por qué el menú no es el control.** Las mismas reglas se vuelven a comprobar en el servidor en cada petición de edición o de borrado, contra la cuenta que la hace, así que una entrada ofrecida por error sigue sin poder cambiarse. [El sistema de permisos](#deep-dive/the-permission-system) trata de dónde salen esas comprobaciones. [[#permissions #trust-boundary]]
**Lo que se lleva una copia.** El texto descifrado de una entrada, al portapapeles del dispositivo, que la aplicación ya no controla una vez ahí. [Seleccionar mensajes](#ticket-detail/message-select) trata ese mismo límite para varias entradas a la vez. [[#privacy]]
**Lo que deja un borrado.** La entrada queda marcada como borrada y se excluye de todas las lecturas posteriores, y su texto cifrado permanece en la fila hasta que la retención lo retire. Nada de un borrado llega al hilo propio del cliente. [Retención de datos](#deep-dive/data-retention) trata esa retirada. [[#retention #server-holds]]
**La función de elegibilidad.** \`context-menu-actions.ts\`, en \`packages/client/src/lib/components/tickets/\`, decide qué acciones ofrece una entrada a partir de su tipo, su origen y su autoría, y \`create-context-menu.svelte.ts\` despacha la elegida. Las guardas del servidor son \`updateFollowUp\` y \`softDeleteInternalNote\`, en \`packages/server/src/tickets/followup-service.ts\`. [[#client-data]]`)
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
* | "Holding an entry in the thread offers the actions that entry allows, which depend on what kind it is and who wrote it. [[#permissions #client-data]] **What i..." |
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