/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_One_Time_BodyInputs */

const en_demo_narrative_client_share_one_time_body = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A share link opens once, and the read is settled by a single conditional update, so one reader among several racing gets the content while the ciphertext column is emptied in that same transaction rather than marked as spent. [[#portal #encryption]]
**The window around the one read.** A link carries seventy-two hours, computed and checked by the database's own clock so the write and the checks that enforce it cannot disagree, and a daily sweep deletes rows whose window has closed. A link not opened in time reports an expired state. [Data retention](#deep-dive/data-retention) covers the sweep. [[#retention #server-holds]]
**The four ways it ends without content.** An already opened state means the link was consumed, whether by the intended reader coming back or by someone else. An expired state means the window closed. A not found state covers both a swept row and an identifier that never existed, so probing an identifier separates nothing. An incomplete link state covers a truncated or corrupted address. [Shared content](#client-share/view) covers the last of those. [[#failure-states #metadata]]
**What single use is worth.** A link intercepted after the intended reader opened it yields the consumed state, because the ciphertext was deleted when the link was first opened. Interception before that first read is a different matter and this does not address it, which is why the message is sent over the organization's own line and kept short-lived rather than treated as private in transit. [Exposure notice](#client-share/exposure-hint) covers what the reader is told about that. [[#trust-boundary #telephony]]
**What the row keeps after the read.** The case it belongs to, a creation time, an expiry and a read time, with no content and no author, and the record of what was sent lives on the case thread under the case key instead. A database seized after the read yields when a share was made and when it was opened, and not a word of it. [[#server-holds #metadata]]
**The consume gate and the sweep.** \`openShare\` in \`packages/server/src/portal/share-service.ts\` holds the conditional update and the classification of the three end states, and \`registerShareCleanupHandler\` in the same file runs the daily cross-tenant delete. The row is \`packages/server/src/db/migrations/tenant/091_share_links.ts\`. [[#server-holds #retention]]`)
};

const es_demo_narrative_client_share_one_time_body = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un enlace compartido se abre una sola vez, y la lectura la resuelve una única actualización condicional, de modo que solo una de varias personas que compitan obtiene el contenido mientras la columna del texto cifrado se vacía en esa misma transacción en lugar de marcarse como gastada. [[#portal #encryption]]
**La ventana alrededor de esa única lectura.** Un enlace lleva setenta y dos horas, calculadas y comprobadas por el reloj de la propia base de datos para que la escritura y las comprobaciones que la hacen valer no puedan discrepar, y un barrido diario elimina las filas cuya ventana se ha cerrado. Un enlace que no se abre a tiempo informa de un estado de caducado. [Retención de datos](#deep-dive/data-retention) trata ese barrido. [[#retention #server-holds]]
**Las cuatro formas de terminar sin contenido.** Un estado de ya abierto significa que el enlace se consumió, ya fuera porque quien debía leerlo volvió o porque lo abrió otra persona. Un estado de caducado significa que la ventana se cerró. Un estado de no encontrado cubre tanto una fila barrida como un identificador que nunca existió, así que sondear un identificador no distingue nada. Un estado de enlace incompleto cubre una dirección cortada o dañada. [Contenido compartido](#client-share/view) trata este último. [[#failure-states #metadata]]
**Cuánto protege el uso único.** Un enlace interceptado después de que quien debía leerlo lo abriera devuelve el estado de consumido, porque el texto cifrado se eliminó cuando el enlace se abrió por primera vez. Una interceptación anterior a esa primera lectura es otra cosa y esto no la resuelve, y por eso el mensaje se envía por la línea de la propia organización y se mantiene de vida corta en lugar de tratarse como privado en tránsito. [Aviso de exposición](#client-share/exposure-hint) trata lo que se le dice a quien lee sobre eso. [[#trust-boundary #telephony]]
**Lo que conserva la fila tras la lectura.** El caso al que pertenece, una hora de creación, una de caducidad y una de lectura, sin contenido y sin autoría, y el registro de lo que se envió vive en el hilo del caso bajo la clave del caso. Una base de datos incautada después de la lectura revela cuándo se creó un recurso compartido y cuándo se abrió, y ni una palabra de él. [[#server-holds #metadata]]
**La puerta de consumo y el barrido.** \`openShare\`, en \`packages/server/src/portal/share-service.ts\`, contiene la actualización condicional y la clasificación de los tres estados finales, y \`registerShareCleanupHandler\`, en el mismo archivo, ejecuta el borrado diario entre organizaciones. La fila es \`packages/server/src/db/migrations/tenant/091_share_links.ts\`. [[#server-holds #retention]]`)
};

const en_xa2_demo_narrative_client_share_one_time_body = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch shàrè lìnk wòrks ònly òncè. Àftèr thè còntènt hàs bèèn shòwn, thè sèrvèr dèlètès thè cìphèrtèxt ìn thè sàmè trànsàctìòn thàt rècòrds thè òpèn, sò thè èncryptèd còntènt nò lòngèr èxìsts òn thè sèrvèr àt àll.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Èxpìry. •••** Shàrè lìnks càrry à 72 hòùr tìmè wìndòw, ànd à dàìly clèànùp dèlètès èxpìrèd èntrìès. Ìf thè lìnk ìs nòt òpènèd bèfòrè thè wìndòw clòsès, thè pàgè shòws àn èxpìrèd stàtè ìnstèàd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whèn ìt ìs èmpty. ••••••** Bèyònd thè sùccèss càsè, thè pàgè dìstìngùìshès fòùr ènd stàtès. Àn àlrèàdy òpènèd stàtè mèàns thè lìnk hàs bèèn cònsùmèd, whèthèr by thè ìntèndèd rèàdèr rètùrnìng òr by sòmèònè èlsè. Àn èxpìrèd stàtè mèàns thè tìmè wìndòw clòsèd. À nòt fòùnd stàtè còvèrs bòth à clèànèd ùp lìnk ànd àn ÌD thàt nèvèr èxìstèd, sò pròbìng à shàrè ÌD rèvèàls nòthìng. Àn ìncòmplètè lìnk stàtè còvèrs à trùncàtèd òr còrrùptèd ÙRL, whìch ìs thè lìkèlìèst rèàl fàìlùrè sìncè thèsè lìnks àrrìvè by SMS ànd thè mèssàgè mày bè splìt, ànd thè pàgè àsks thè rèàdèr tò chèck thèy òpènèd thè còmplètè lìnk.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Why sìnglè ùsè màttèrs. •••••••** Sìnglè ùsè àccèss mèàns thàt ìf thè lìnk ìs ìntèrcèptèd àftèr thè ìntèndèd rèàdèr hàs òpènèd ìt, thè ìntèrcèptòr fìnds ònly thè cònsùmèd stàtè ànd thè cìphèrtèxt ìs gònè fròm thè sèrvèr ràthèr thàn mèrèly ìnàccèssìblè. Ìt dòès nòt pròtèct àgàìnst ìntèrcèptìòn bèfòrè thè rèàdèr òpèns ìt. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A share link opens once, and the read is settled by a single conditional update, so one reader among several racing gets the content while the ciphertext col..." |
*
* @param {Demo_Narrative_Client_Share_One_Time_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_one_time_body = /** @type {((inputs?: Demo_Narrative_Client_Share_One_Time_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_One_Time_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_one_time_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_client_share_one_time_body(inputs)
	return en_demo_narrative_client_share_one_time_body(inputs)
});