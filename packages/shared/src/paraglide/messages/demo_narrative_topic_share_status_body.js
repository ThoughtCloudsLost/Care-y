/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Status_BodyInputs */

const en_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each share link follow-up in the thread reports whether its link is waiting, opened, or expired. [[#portal]]
**Three states, two fields.** The share record stores a read time and an expiry. A record with a read time is opened. A record without a read time whose expiry is in the past is expired. Anything else is waiting. [[#metadata]]
**What does the state not report?** The state tells whether the link was consumed, not whether the message carrying it was delivered. A link sent by text that never arrived at the recipient's phone reads as waiting, the same as a link that arrived and that nobody opened. [Share link](#ticket-detail/share-link) covers the delivery path. [[#failure-states #telephony]]
**Opened and the permission gate.** Opened is terminal. The server delivers the ciphertext once and clears the stored copy in the same atomic update. The state cannot revert, and a second reader of the same link finds nothing. [Single use access](#client-share/one-time) covers the recipient's side. Reading these states requires the Manage share links permission. A user without it sees the follow-up in the [Conversation thread](#ticket-detail/conversation) and no state beneath it. [[#permissions #server-holds]]
**The status query.** \`listShares\` in \`packages/server/src/routes/client-portal.ts\` returns the times for every share on the ticket, never the ciphertext. Each follow-up locates its own record through the share's ID stored alongside it. The query goes stale immediately, because a client can consume a link at any moment and a cached waiting state would survive the change. [[#metadata]]`)
};

const es_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada seguimiento de enlace compartido en el hilo informa si su enlace está en espera, abierto o caducado. [[#portal]]
**Tres estados, dos campos.** El registro del enlace compartido almacena una fecha de lectura y una de caducidad. Un registro con fecha de lectura está abierto. Un registro sin fecha de lectura cuya caducidad ya pasó está caducado. Todo lo demás está en espera. [[#metadata]]
**¿Qué no informa el estado?** El estado indica si el enlace fue consumido, no si el mensaje que lo llevaba fue entregado. Un enlace enviado por texto que nunca llegó al teléfono del destinatario aparece como en espera, igual que un enlace que llegó y que nadie abrió. [Enlace compartido](#ticket-detail/share-link) trata la ruta de entrega. [[#failure-states #telephony]]
**Estado terminal y permisos.** Abierto es terminal. El servidor entrega el texto cifrado una vez y borra la copia almacenada en la misma actualización atómica. El estado no puede revertirse, y una segunda lectura del mismo enlace no encuentra nada. [Acceso de un solo uso](#client-share/one-time) trata el lado de quien lo recibe. Leer estos estados requiere el permiso Gestionar enlaces compartidos. Sin ese permiso se ve el seguimiento en el [Hilo de conversación](#ticket-detail/conversation) y ningún estado debajo. [[#permissions #server-holds]]
**La consulta de estado.** \`listShares\`, en \`packages/server/src/routes/client-portal.ts\`, devuelve las fechas de todos los enlaces compartidos del ticket y nunca el texto cifrado. Cada seguimiento localiza su registro mediante el ID del enlace compartido almacenado junto a él. La consulta caduca de inmediato, porque un cliente puede consumir un enlace en cualquier momento y un estado de espera en caché sobreviviría al cambio. [[#metadata]]`)
};

const en_xa2_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch shàrè lìnk fòllòw-ùp ìn thè thrèàd rèpòrts whèthèr ìts lìnk ìs wàìtìng, òpènèd, òr èxpìrèd. [[#pòrtàl]]
 •••••••••••••••••••••••••••••••••**Thrèè stàtès, twò fìèlds. ••••••••** Thè shàrè rècòrd stòrès à rèàd tìmè ànd àn èxpìry. À rècòrd wìth à rèàd tìmè ìs òpènèd. À rècòrd wìthòùt à rèàd tìmè whòsè èxpìry ìs ìn thè pàst ìs èxpìrèd. Ànythìng èlsè ìs wàìtìng. [[#mètàdàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès thè stàtè nòt rèpòrt? ••••••••••** Thè stàtè tèlls whèthèr thè lìnk wàs cònsùmèd, nòt whèthèr thè mèssàgè càrryìng ìt wàs dèlìvèrèd. À lìnk sènt by tèxt thàt nèvèr àrrìvèd àt thè rècìpìènt's phònè rèàds às wàìtìng, thè sàmè às à lìnk thàt àrrìvèd ànd thàt nòbòdy òpènèd. [Shàrè lìnk](#tìckèt-dètàìl/shàrè-lìnk) còvèrs thè dèlìvèry pàth. [[#fàìlùrè-stàtès #tèlèphòny]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Òpènèd ànd thè pèrmìssìòn gàtè. ••••••••••** Òpènèd ìs tèrmìnàl. Thè sèrvèr dèlìvèrs thè cìphèrtèxt òncè ànd clèàrs thè stòrèd còpy ìn thè sàmè àtòmìc ùpdàtè. Thè stàtè cànnòt rèvèrt, ànd à sècònd rèàdèr òf thè sàmè lìnk fìnds nòthìng. [Sìnglè ùsè àccèss](#clìènt-shàrè/ònè-tìmè) còvèrs thè rècìpìènt's sìdè. Rèàdìng thèsè stàtès rèqùìrès thè Mànàgè shàrè lìnks pèrmìssìòn. À ùsèr wìthòùt ìt sèès thè fòllòw-ùp ìn thè [Cònvèrsàtìòn thrèàd](#tìckèt-dètàìl/cònvèrsàtìòn) ànd nò stàtè bènèàth ìt. [[#pèrmìssìòns #sèrvèr-hòlds]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè stàtùs qùèry. ••••••** \`lìstShàrès\` ìn \`pàckàgès/sèrvèr/src/ròùtès/clìènt-pòrtàl.ts\` rètùrns thè tìmès fòr èvèry shàrè òn thè tìckèt, nèvèr thè cìphèrtèxt. Èàch fòllòw-ùp lòcàtès ìts òwn rècòrd thròùgh thè shàrè's ÌD stòrèd àlòngsìdè ìt. Thè qùèry gòès stàlè ìmmèdìàtèly, bècàùsè à clìènt càn cònsùmè à lìnk àt àny mòmènt ànd à càchèd wàìtìng stàtè wòùld sùrvìvè thè chàngè. [[#mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Each share link follow-up in the thread reports whether its link is waiting, opened, or expired. [[#portal]] **Three states, two fields.** The share record s..." |
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