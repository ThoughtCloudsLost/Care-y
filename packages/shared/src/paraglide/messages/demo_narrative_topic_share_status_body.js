/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Status_BodyInputs */

const en_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A share link entry in the thread carries the state of its link: waiting, opened, or expired. [[#portal]]
**What each state is read from.** The share record holds a read time and an expiry and nothing else that bears on this. A record with a read time reads as opened; a record without one whose expiry has passed reads as expired; anything else reads as waiting. The comparison against the expiry happens in the browser against the device clock, so a device with a wrong clock reads a live link as expired. [[#metadata #failure-states]]
**What the state does not say.** It reports what happened to the link, not what happened to the message that carried it. A link sent by text that never reached the recipient's phone sits at waiting, exactly like a link that arrived and was not opened. [Sending a share link](#ticket-detail/share-link) covers the delivery path. [[#failure-states #telephony]]
**What opened means, and who can see it.** Opened means the link was consumed: the server handed the ciphertext out once and emptied the column, so the state cannot go back and a second reader of the same link finds nothing. Reading these states needs permission to manage share links, so an account without it sees the thread entry and no state beneath it. [One-time links](#client-share/one-time) covers the recipient's side. [[#permissions #server-holds]]
**The status query and its line.** \`listShares\` in \`packages/server/src/routes/client-portal.ts\` returns the times for every share on the case and never the ciphertext, and each thread entry finds its own record through the share identifier stored with it. The query is held stale from the moment it lands, because a client can consume a link at any point and a cached waiting state would outlive the fact. [[#metadata]]`)
};

const es_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una entrada de enlace compartido en el hilo lleva el estado de su enlace: en espera, abierto o caducado. [[#portal]]
**De dónde sale cada estado.** El registro del envío guarda una fecha de lectura y una de caducidad, y nada más que influya en esto. Un registro con fecha de lectura se lee como abierto; uno sin ella cuya caducidad ya pasó se lee como caducado; cualquier otro se lee como en espera. La comparación con la caducidad ocurre en el navegador contra el reloj del dispositivo, así que un dispositivo con el reloj mal lee como caducado un enlace vivo. [[#metadata #failure-states]]
**Lo que el estado no dice.** Indica qué le pasó al enlace, no qué le pasó al mensaje que lo llevaba. Un enlace enviado por texto que nunca llegó al teléfono del destinatario se queda en espera, igual que un enlace que llegó y no se abrió. [Enviar un enlace compartido](#ticket-detail/share-link) trata el camino de entrega. [[#failure-states #telephony]]
**Qué significa abierto y quién puede verlo.** Abierto significa que el enlace se consumió: el servidor entregó el texto cifrado una vez y vació la columna, así que el estado no puede volver atrás y una segunda lectura del mismo enlace no encuentra nada. Leer estos estados necesita permiso para gestionar enlaces compartidos, de modo que una cuenta sin él ve la entrada del hilo y ningún estado debajo. [Enlaces de un solo uso](#client-share/one-time) trata el lado de quien lo recibe. [[#permissions #server-holds]]
**La consulta de estado y su línea.** \`listShares\`, en \`packages/server/src/routes/client-portal.ts\`, devuelve las fechas de todos los envíos del caso y nunca el texto cifrado, y cada entrada del hilo encuentra su registro mediante el identificador de envío guardado con ella. La consulta se considera caducada desde que llega, porque un cliente puede consumir un enlace en cualquier momento y un estado de espera en caché sobreviviría al hecho. [[#metadata]]`)
};

const en_xa2_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À shàrè lìnk èntry ìn thè thrèàd càrrìès thè stàtè òf ìts lìnk: wàìtìng, òpènèd, òr èxpìrèd. [[#pòrtàl]]
 ••••••••••••••••••••••••••••••••**Whàt èàch stàtè ìs rèàd fròm. •••••••••** Thè shàrè rècòrd hòlds à rèàd tìmè ànd àn èxpìry ànd nòthìng èlsè thàt bèàrs òn thìs. À rècòrd wìth à rèàd tìmè rèàds às òpènèd; à rècòrd wìthòùt ònè whòsè èxpìry hàs pàssèd rèàds às èxpìrèd; ànythìng èlsè rèàds às wàìtìng. Thè còmpàrìsòn àgàìnst thè èxpìry hàppèns ìn thè bròwsèr àgàìnst thè dèvìcè clòck, sò à dèvìcè wìth à wròng clòck rèàds à lìvè lìnk às èxpìrèd. [[#mètàdàtà #fàìlùrè-stàtès]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt thè stàtè dòès nòt sày. •••••••••** Ìt rèpòrts whàt hàppènèd tò thè lìnk, nòt whàt hàppènèd tò thè mèssàgè thàt càrrìèd ìt. À lìnk sènt by tèxt thàt nèvèr rèàchèd thè rècìpìènt's phònè sìts àt wàìtìng, èxàctly lìkè à lìnk thàt àrrìvèd ànd wàs nòt òpènèd. [Sèndìng à shàrè lìnk](#tìckèt-dètàìl/shàrè-lìnk) còvèrs thè dèlìvèry pàth. [[#fàìlùrè-stàtès #tèlèphòny]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt òpènèd mèàns, ànd whò càn sèè ìt. ••••••••••••** Òpènèd mèàns thè lìnk wàs cònsùmèd: thè sèrvèr hàndèd thè cìphèrtèxt òùt òncè ànd èmptìèd thè còlùmn, sò thè stàtè cànnòt gò bàck ànd à sècònd rèàdèr òf thè sàmè lìnk fìnds nòthìng. Rèàdìng thèsè stàtès nèèds pèrmìssìòn tò mànàgè shàrè lìnks, sò àn àccòùnt wìthòùt ìt sèès thè thrèàd èntry ànd nò stàtè bènèàth ìt. [Ònè-tìmè lìnks](#clìènt-shàrè/ònè-tìmè) còvèrs thè rècìpìènt's sìdè. [[#pèrmìssìòns #sèrvèr-hòlds]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Thè stàtùs qùèry ànd ìts lìnè. •••••••••** \`lìstShàrès\` ìn \`pàckàgès/sèrvèr/src/ròùtès/clìènt-pòrtàl.ts\` rètùrns thè tìmès fòr èvèry shàrè òn thè càsè ànd nèvèr thè cìphèrtèxt, ànd èàch thrèàd èntry fìnds ìts òwn rècòrd thròùgh thè shàrè ìdèntìfìèr stòrèd wìth ìt. Thè qùèry ìs hèld stàlè fròm thè mòmènt ìt lànds, bècàùsè à clìènt càn cònsùmè à lìnk àt àny pòìnt ànd à càchèd wàìtìng stàtè wòùld òùtlìvè thè fàct. [[#mètàdàtà]] ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A share link entry in the thread carries the state of its link: waiting, opened, or expired. [[#portal]] **What each state is read from.** The share record h..." |
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