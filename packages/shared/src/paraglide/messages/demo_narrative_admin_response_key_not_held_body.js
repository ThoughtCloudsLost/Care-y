/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs */

const en_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A submission the user holds no key for still lists, with its arrival time and no answers, so the existence of a response is never hidden from someone who cannot read it. A second state covers a row whose key material is present and whose decryption did not succeed, and the two are reported apart because one may be fixable and the other is not. [[#keys #failure-states]]
**How a submission gets its readers.** The public form seals the submission's key to the organization's public key, which is the interim state: during that window any account with permission to read submissions can open it. The first user to open the ticket that submission created converts the seal into one wrapped copy per reader, for every active member of the destination queue and every holder of the permission who has published a key, and the sealed copy is deleted. After that, holding a wrap is the only way in. [How encryption works](#deep-dive/how-encryption-works) covers the sealing. [[#encryption #keys #portal]]
**Who ends up without one.** An account that joined the queue after the conversion, or was granted the permission after it, or had published no key at the time. Any of those leaves the row listed and unreadable until a key holder opens the viewer, which mints the missing wraps against the current queue and permission sets. [Response cards](#admin-responses/responses) covers that backfill pass. [[#keys]]
**Why the permission is more than a gate.** Granting permission to read submissions from every queue puts the account in the wrap set from then on, so it receives keys to submissions in queues it is not a member of. Taking the permission away stops new wraps and does not remove the ones already issued: those keys stay usable until the ticket key is rotated. [Permission matrix](#admin-people/role-permissions) covers where the permission sits and what it warns about. [[#permissions #keys #privacy]]
**The conversion path and its guards.** \`convertIntakeKeyWrap\` in \`packages/server/src/portal/intake-conversion-service.ts\` runs the whole exchange in one transaction, deleting the interim row first so that concurrent openers serialize, validating every target against queue membership and permission holders, and rolling back to the sealed state if any insert fails. Key rotation is blocked while any interim wrap is outstanding. [Ticket decryption](#tickets/decryption) covers per-ticket wrapping for cases that did not start on a form. [[#keys]]`)
};

const es_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un envío del que la persona usuaria no tiene la clave aparece igualmente en la lista, con su hora de llegada y sin respuestas, de modo que la existencia de una respuesta nunca se le oculta a quien no puede leerla. Un segundo estado cubre una fila cuyo material de clave está presente y cuyo descifrado no salió bien, y los dos se indican por separado porque uno puede tener arreglo y el otro no. [[#keys #failure-states]]
**Cómo consigue sus lectores un envío.** El formulario público sella la clave del envío con la clave pública de la organización, que es el estado provisional: durante esa ventana cualquier cuenta con permiso para leer respuestas puede abrirlo. La primera persona que abre el ticket que creó ese envío convierte el sello en una copia envuelta por lectora, para cada miembro activo de la cola de destino y cada titular del permiso que haya publicado una clave, y la copia sellada se elimina. A partir de ahí, tener un envoltorio es la única entrada. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata ese sellado. [[#encryption #keys #portal]]
**Quién se queda sin uno.** Una cuenta que entró en la cola después de la conversión, o que recibió el permiso después de ella, o que no había publicado ninguna clave en ese momento. Cualquiera de esos casos deja la fila listada e ilegible hasta que un titular de clave abre el visor, que genera los envoltorios que faltan contra los conjuntos actuales de cola y de permiso. [Tarjetas de respuesta](#admin-responses/responses) trata esa pasada de relleno. [[#keys]]
**Por qué el permiso es más que una puerta.** Conceder el permiso para leer respuestas de todas las colas mete a la cuenta en el conjunto de envoltorios desde ese momento, así que recibe claves de envíos de colas a las que no pertenece. Retirar el permiso detiene los envoltorios nuevos y no retira los ya emitidos: esas claves siguen sirviendo hasta que se rota la clave del ticket. [Matriz de permisos](#admin-people/role-permissions) trata dónde se sitúa el permiso y de qué avisa. [[#permissions #keys #privacy]]
**La ruta de conversión y sus resguardos.** \`convertIntakeKeyWrap\`, en \`packages/server/src/portal/intake-conversion-service.ts\`, ejecuta todo el intercambio en una sola transacción: borra primero la fila provisional para que quienes abren a la vez se serialicen, valida cada destinatario contra la pertenencia a la cola y los titulares del permiso, y vuelve al estado sellado si alguna inserción falla. La rotación de claves queda bloqueada mientras haya algún envoltorio provisional pendiente. [Descifrado de tickets](#tickets/decryption) trata el envoltorio por ticket de los casos que no empezaron en un formulario. [[#keys]]`)
};

const en_xa2_demo_narrative_admin_response_key_not_held_body = /** @type {(inputs: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à rèspònsè wàs èncryptèd ùndèr à kèy thè ùsèr dòès nòt hòld, thè rèspònsè ròw shòws thè sùbmìssìòn tìmè bùt nòt thè fìèld vàlùès, sò thè ùsèr càn sèè thàt à rèspònsè èxìsts wìthòùt bèìng àblè tò rèàd ìt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Whèn thè fìrst ùsèr òpèns à tìckèt crèàtèd fròm àn ìntàkè fòrm, thè systèm dìstrìbùtès thè dècryptìòn kèy tò èvèry àctìvè ùsèr whò hàs à pùblìshèd kèy ànd bèlòngs tò èìthèr thè dèstìnàtìòn qùèùè òr hòlds thè Vìèw ìntàkè rèspònsès pèrmìssìòn. À ùsèr òùtsìdè thàt sèt àt cònvèrsìòn tìmè hàs nò còpy òf thè kèy ànd cànnòt dècrypt thè rèspònsè fìèlds.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìf ìt fàìls. ••••** À sèpàràtè stàtè àppèàrs whèn kèy màtèrìàl èxìsts fòr thè ùsèr bùt dècryptìòn dìd nòt sùccèèd, ànd thèrè mày bè nòthìng thè ùsèr càn dò àbòùt èìthèr stàtè. Èàch càrrìès ìts òwn glyph ànd èxplànàtìòn sò thè ùsèr càn tèll whìch sìtùàtìòn àpplìès. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A submission the user holds no key for still lists, with its arrival time and no answers, so the existence of a response is never hidden from someone who can..." |
*
* @param {Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_key_not_held_body = /** @type {((inputs?: Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Response_Key_Not_Held_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_response_key_not_held_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_response_key_not_held_body(inputs)
	return en_demo_narrative_admin_response_key_not_held_body(inputs)
});