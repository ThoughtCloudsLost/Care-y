/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Quarantine_BodyInputs */

const en_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A voicemail that cannot be attached to a case is held in quarantine instead of being discarded, and waits there for someone to route it. A voicemail lands there when the organization has no intake queue set, when the caller could not be matched to a client, or when the call the recording belongs to was not on file. [[#telephony #failure-states]]
**What happens to the recording in between.** The server fetches the audio from the provider, seals it in a sealed-box envelope that only the organization's private key opens, stores the sealed bytes and then deletes the provider's copy of both the recording and the call. The caller's number and the number called are sealed the same way. The server keeps no readable copy at any point, and a stalled deletion at the provider is retried as a queued job rather than dropped. [The telephony relay](#deep-dive/the-telephony-relay) covers the same handling during a normal call. [[#encryption #privacy]]
**Reviewing and routing.** The sealed audio is opened in the browser, so reviewing a voicemail is the one way to learn who called when the number did not resolve. Routing it to a new or existing ticket sends the opened recording back for re-encryption under that ticket's own key, and the sealed original is deleted once the follow-up exists. When two people route the same voicemail the first one settles it, and the second is told it was already resolved. [Voicemails](#ticket-detail/voicemails) covers the recording once it is on a ticket. [[#keys]]
**What the quarantine row shows.** The reason, the status, the duration, the size and the times are plaintext, and the numbers are ciphertext, so a database dump shows how many calls an organization failed to route and when, and not who called. Every arrival, routing and dismissal is written to the audit log, and dismissing a voicemail deletes its audio. [Audit log](#admin-logs/audit) covers that record. [[#server-holds #metadata]]
**The quarantine service and its notice.** \`packages/server/src/telephony/voicemail-quarantine.ts\` holds the seal, store, audit and cleanup path, and a duplicate webhook delivery is absorbed by the unique recording id rather than storing a second copy. The arrival notice is sent to everyone holding permission to manage the quarantine rather than to a role, and reviewing or routing needs that same permission. [The permission system](#deep-dive/the-permission-system) covers how a permission is granted. [[#permissions]]`)
};

const es_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un mensaje de voz que no se puede asociar a un caso se retiene en cuarentena en lugar de descartarse, y allí espera a que alguien lo enrute. Un mensaje llega ahí cuando la organización no tiene cola de recepción configurada, cuando no se pudo asociar a quien llamó con ningún cliente, o cuando la llamada a la que pertenece la grabación no estaba registrada. [[#telephony #failure-states]]
**Qué le pasa a la grabación mientras tanto.** El servidor descarga el audio del proveedor, lo sella en un sobre sellado que solo abre la clave privada de la organización, guarda los bytes sellados y después borra del proveedor tanto la grabación como la llamada. El número de quien llamó y el número llamado se sellan de la misma forma. El servidor no conserva ninguna copia legible en ningún momento, y un borrado que falle en el proveedor se reintenta como trabajo en cola en lugar de abandonarse. [El relé de telefonía](#deep-dive/the-telephony-relay) trata este mismo manejo durante una llamada normal. [[#encryption #privacy]]
**Revisar y enrutar.** El audio sellado se abre en el navegador, así que escuchar el mensaje es la única manera de saber quién llamó cuando el número no se resolvió. Enrutarlo a un ticket nuevo o existente devuelve la grabación abierta para cifrarla de nuevo con la clave propia de ese ticket, y el original sellado se borra en cuanto existe el seguimiento. Si dos personas enrutan el mismo mensaje, la primera lo resuelve y a la segunda se le indica que ya estaba resuelto. [Mensajes de voz](#ticket-detail/voicemails) trata la grabación una vez está en un ticket. [[#keys]]
**Lo que muestra la fila de cuarentena.** El motivo, el estado, la duración, el tamaño y las fechas están en texto plano, y los números son texto cifrado, de modo que un volcado de la base de datos muestra cuántas llamadas no pudo enrutar una organización y cuándo, y no quién llamó. Cada llegada, cada enrutamiento y cada descarte se escriben en el registro de auditoría, y descartar un mensaje borra su audio. [Registro de auditoría](#admin-logs/audit) trata ese registro. [[#server-holds #metadata]]
**El servicio de cuarentena y su aviso.** \`packages/server/src/telephony/voicemail-quarantine.ts\` tiene la ruta de sellado, guardado, auditoría y limpieza, y una entrega repetida del webhook queda absorbida por el identificador único de la grabación en lugar de guardar una segunda copia. El aviso de llegada se envía a todas las personas con permiso para gestionar la cuarentena y no a un rol, y revisar o enrutar requiere ese mismo permiso. [El sistema de permisos](#deep-dive/the-permission-system) explica cómo se concede un permiso. [[#permissions]]`)
};

const en_xa2_demo_narrative_admin_quarantine_body = /** @type {(inputs: Demo_Narrative_Admin_Quarantine_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòìcèmàìls fròm ùnknòwn càllèrs lànd ìn thè qùàràntìnè ànd wàìt fòr rèvìèw.
 •••••••••••••••••••••••**Èncryptìòn. ••••** Qùàràntìnè àùdìò ìs sèàlèd tò thè òrgànìzàtìòn's pùblìc kèy bèfòrè stòràgè sò thè sèrvèr cànnòt àccèss thè rècòrdìng, ànd thè càllèr ànd càllèd nùmbèrs àrè sèàlèd thè sàmè wày.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Plàybàck. •••** Qùàràntìnè àùdìò rèàchès thè bròwsèr às sèàlèd cìphèrtèxt, ànd thè ùsèr's bròwsèr ùnsèàls ìt wìth thè òrgànìzàtìòn's prìvàtè kèy sò dècryptìòn hàppèns lòcàlly.
 •••••••••••••••••••••••••••••••••••••••••••••••••**Ròùtìng. •••** À qùàràntìnèd vòìcèmàìl càn bè ròùtèd tò à nèw òr èxìstìng tìckèt, òr dìsmìssèd.
 •••••••••••••••••••••••••**Qùàràntìnè rèàsòns. ••••••** À vòìcèmàìl rèàchès thè qùàràntìnè whèn nò ìntàkè qùèùè wàs cònfìgùrèd tò rècèìvè thè càll, whèn thè càllèr còùld nòt bè màtchèd tò à clìènt, òr whèn nò tràckèd càll èxìstèd tò ròùtè thè rècòrdìng tò.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Rèvìèwìng ànd ròùtìng qùàràntìnèd vòìcèmàìls rèqùìrès thè Mànàgè vòìcèmàìl qùàràntìnè pèrmìssìòn. ••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A voicemail that cannot be attached to a case is held in quarantine instead of being discarded, and waits there for someone to route it. A voicemail lands th..." |
*
* @param {Demo_Narrative_Admin_Quarantine_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_quarantine_body = /** @type {((inputs?: Demo_Narrative_Admin_Quarantine_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Quarantine_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_quarantine_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_quarantine_body(inputs)
	return en_demo_narrative_admin_quarantine_body(inputs)
});