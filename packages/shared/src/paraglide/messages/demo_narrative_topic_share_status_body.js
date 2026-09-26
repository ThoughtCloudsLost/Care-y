/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Status_BodyInputs */

const en_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A share link follow-up in the thread carries the state of its link: waiting, opened, or expired. [[#portal]]
**Three states, two fields.** The share record holds a read time and an expiry. A record with a read time is opened. A record with no read time whose expiry has passed is expired. Anything else is waiting. [[#metadata]]
**What does the state not report?** The state reports what happened to the link, not what happened to the message that carried it. A link sent by text that never reached the recipient's phone sits at waiting, exactly like a link that arrived and was not opened. [Share link](#ticket-detail/share-link) covers the delivery path. [[#failure-states #telephony]]
**Opened and the permission gate.** Opened is terminal. The server hands the ciphertext out once and empties the column in the same conditional update, so the state cannot revert and a second reader of the same link finds nothing. [Single use access](#client-share/one-time) covers the recipient's side. Reading these states requires the Manage share links permission. An account without it sees the follow-up in the [Conversation thread](#ticket-detail/conversation) and no state beneath it. [[#permissions #server-holds]]
**The status query.** \`listShares\` in \`packages/server/src/routes/client-portal.ts\` returns the times for every share on the ticket and never the ciphertext. Each follow-up finds its own record through the share identifier stored with it. The query is stale from the moment it lands, because a client can consume a link at any point and a cached waiting state would outlive the fact. [[#metadata]]`)
};

const es_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un seguimiento de enlace compartido en el hilo lleva el estado de su enlace: en espera, abierto o caducado. [[#portal]]
**Tres estados, dos campos.** El registro del enlace compartido guarda una fecha de lectura y una de caducidad. Un registro con fecha de lectura está abierto. Un registro sin fecha de lectura cuya caducidad ya pasó está caducado. Todo lo demás está en espera. [[#metadata]]
**¿Qué no informa el estado?** El estado informa lo que le pasó al enlace, no lo que le pasó al mensaje que lo llevaba. Un enlace enviado por texto que nunca llegó al teléfono del destinatario se queda en espera, igual que un enlace que llegó y no se abrió. [Enlace compartido](#ticket-detail/share-link) trata la ruta de entrega. [[#failure-states #telephony]]
**Estado terminal y permisos.** Abierto es terminal. El servidor entrega el texto cifrado una vez y vacía la columna en la misma actualización condicional, así que el estado no puede revertirse y una segunda lectura del mismo enlace no encuentra nada. [Acceso de un solo uso](#client-share/one-time) trata el lado de quien lo recibe. Leer estos estados requiere el permiso Gestionar enlaces compartidos. Una cuenta sin él ve el seguimiento en el [Hilo de conversación](#ticket-detail/conversation) y ningún estado debajo. [[#permissions #server-holds]]
**La consulta de estado.** \`listShares\`, en \`packages/server/src/routes/client-portal.ts\`, devuelve las fechas de todos los enlaces compartidos del ticket y nunca el texto cifrado. Cada seguimiento encuentra su registro mediante el identificador de enlace compartido guardado con él. La consulta se considera obsoleta desde que llega, porque un cliente puede consumir un enlace en cualquier momento y un estado de espera en caché sobreviviría al hecho. [[#metadata]]`)
};

const en_xa2_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À shàrè lìnk fòllòw-ùp ìn thè thrèàd càrrìès thè stàtè òf ìts lìnk: wàìtìng, òpènèd, òr èxpìrèd. [[#pòrtàl]]
 •••••••••••••••••••••••••••••••••**Thrèè stàtès, twò fìèlds. ••••••••** Thè shàrè rècòrd hòlds à rèàd tìmè ànd àn èxpìry. À rècòrd wìth à rèàd tìmè ìs òpènèd. À rècòrd wìth nò rèàd tìmè whòsè èxpìry hàs pàssèd ìs èxpìrèd. Ànythìng èlsè ìs wàìtìng. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè stàtè nòt rèpòrt? ••••••••••** Thè stàtè rèpòrts whàt hàppènèd tò thè lìnk, nòt whàt hàppènèd tò thè mèssàgè thàt càrrìèd ìt. À lìnk sènt by tèxt thàt nèvèr rèàchèd thè rècìpìènt's phònè sìts àt wàìtìng, èxàctly lìkè à lìnk thàt àrrìvèd ànd wàs nòt òpènèd. [Shàrè lìnk](#tìckèt-dètàìl/shàrè-lìnk) còvèrs thè dèlìvèry pàth. [[#fàìlùrè-stàtès #tèlèphòny]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Òpènèd ànd thè pèrmìssìòn gàtè. ••••••••••** Òpènèd ìs tèrmìnàl. Thè sèrvèr hànds thè cìphèrtèxt òùt òncè ànd èmptìès thè còlùmn ìn thè sàmè còndìtìònàl ùpdàtè, sò thè stàtè cànnòt rèvèrt ànd à sècònd rèàdèr òf thè sàmè lìnk fìnds nòthìng. [Sìnglè ùsè àccèss](#clìènt-shàrè/ònè-tìmè) còvèrs thè rècìpìènt's sìdè. Rèàdìng thèsè stàtès rèqùìrès thè Mànàgè shàrè lìnks pèrmìssìòn. Àn àccòùnt wìthòùt ìt sèès thè fòllòw-ùp ìn thè [Cònvèrsàtìòn thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) ànd nò stàtè bènèàth ìt. [[#pèrmìssìòns #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè stàtùs qùèry. ••••••** \`lìstShàrès\` ìn \`pàckàgès/sèrvèr/src/ròùtès/clìènt-pòrtàl.ts\` rètùrns thè tìmès fòr èvèry shàrè òn thè tìckèt ànd nèvèr thè cìphèrtèxt. Èàch fòllòw-ùp fìnds ìts òwn rècòrd thròùgh thè shàrè ìdèntìfìèr stòrèd wìth ìt. Thè qùèry ìs stàlè fròm thè mòmènt ìt lànds, bècàùsè à clìènt càn cònsùmè à lìnk àt àny pòìnt ànd à càchèd wàìtìng stàtè wòùld òùtlìvè thè fàct. [[#mètàdàtà]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A share link follow-up in the thread carries the state of its link: waiting, opened, or expired. [[#portal]] **Three states, two fields.** The share record h..." |
*
* @param {Demo_Narrative_Topic_Share_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_status_body = /** @type {((inputs?: Demo_Narrative_Topic_Share_Status_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Share_Status_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_share_status_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_share_status_body(inputs)
	return en_demo_narrative_topic_share_status_body(inputs)
});