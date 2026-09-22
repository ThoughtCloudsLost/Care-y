/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Unread_Badges_BodyInputs */

const en_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A ticket carries an unread count when someone other than the user has replied to it since the user last read it. [[#client-data]]
**How a reply is counted as unread.** Each account keeps one encrypted read cursor per ticket, recording how far it has read. For the rows on the page the server returns that ciphertext together with up to twenty recent reply times, leaving out system events and the account's own replies, and the browser decrypts the cursor in the crypto worker and counts the times that fall after it. A ticket nobody has opened has no real cursor and is never unread, because its New mark already announces it, and a busier ticket reads as twenty because that is as deep as the window goes. [[#encryption #client-data]]
**What the cursor row tells the server.** A row is created with random bytes the first time an account opens a ticket, so the row records that the ticket was opened and the value stays opaque whether or not anything has been read. Closing a ticket deletes its cursor rows. Nothing derived from read state is ever sent back, so the server cannot say which tickets an account has read, only which ones it has opened. [The trust boundary](#deep-dive/the-trust-boundary) sets out that row beside the others. [[#server-holds #privacy #metadata]]
**When the count is absent rather than zero.** A count needs the cursor decrypted, so it reads as nothing while decrypts are in flight, after the idle timer zeroes keys, and on a ticket whose key was never wrapped for the account. None of those three is reported as read. [Ticket decryption](#tickets/decryption) covers the missing wrap. [[#failure-states #keys]]
**The read-state composable and its row.** \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` holds both sources, the window for the loaded rows and the sweep for everything else, the cursor row is \`048_create_ticket_read_cursors.ts\`, and its lifecycle is \`packages/server/src/tickets/read-cursor-service.ts\`. [Needs attention](#dashboard/needs-attention) covers the overview bucket that reads from this. [[#client-data]]`)
};

const es_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un ticket lleva un recuento de no leídos cuando alguien distinto de la persona usuaria ha respondido desde la última vez que ella lo leyó. [[#client-data]]
**Cómo se cuenta una respuesta como no leída.** Cada cuenta mantiene un cursor de lectura cifrado por ticket que registra hasta dónde ha leído. Para las filas de la página, el servidor devuelve ese texto cifrado junto con hasta veinte horas de respuesta recientes, sin los eventos del sistema ni las respuestas de la propia cuenta, y el navegador descifra el cursor en el worker criptográfico y cuenta las horas posteriores. Un ticket que nadie ha abierto no tiene cursor real y nunca está sin leer, porque su marca de nuevo ya lo anuncia, y un ticket con más movimiento llega a veinte porque hasta ahí llega la ventana. [[#encryption #client-data]]
**Lo que la fila del cursor le dice al servidor.** La fila se crea con bytes aleatorios la primera vez que una cuenta abre un ticket, de modo que registra que el ticket se abrió y el valor sigue siendo opaco se haya leído algo o no. Cerrar un ticket borra sus filas de cursor. Nada derivado del estado de lectura se devuelve al servidor, así que el servidor no puede decir qué tickets ha leído una cuenta, solo cuáles ha abierto. [La frontera de confianza](#deep-dive/the-trust-boundary) expone esa fila junto a las demás. [[#server-holds #privacy #metadata]]
**Cuándo el recuento falta en lugar de ser cero.** Un recuento necesita el cursor descifrado, así que no aparece mientras hay descifrados en curso, después de que el temporizador de inactividad ponga las claves a cero y en un ticket cuya clave nunca se envolvió para la cuenta. Ninguno de esos tres casos se presenta como leído. [Descifrado de tickets](#tickets/decryption) trata el envoltorio ausente. [[#failure-states #keys]]
**El compositor de estado de lectura y su fila.** \`packages/client/src/lib/tickets/create-list-read-state.svelte.ts\` reúne las dos fuentes, la ventana para las filas cargadas y el barrido para el resto, la fila del cursor es \`048_create_ticket_read_cursors.ts\`, y su ciclo de vida es \`packages/server/src/tickets/read-cursor-service.ts\`. [Necesita atención](#dashboard/needs-attention) trata el grupo del resumen que lee de aquí. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èàch tìckèt ìn thè lìst shòws àn ùnrèàd còùnt whèn ìt hàs mèssàgès thè vòlùntèèr hàs nòt yèt rèàd. Thè còùnt rèflècts nèw mèssàgès sìncè thè vòlùntèèr làst vìèwèd thàt tìckèt.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw rèàd stàtè wòrks. •••••••** Èàch vòlùntèèr hàs àn èncryptèd rèàd cùrsòr pèr tìckèt thàt rècòrds hòw fàr thèy hàvè rèàd. À cùrsòr ròw ìs crèàtèd òn fìrst òpèn, sò thè sèrvèr càn sèè whìch tìckèts à vòlùntèèr hàs vìsìtèd, bùt thè cùrsòr vàlùè ìtsèlf ìs òpàqùè cìphèrtèxt thè sèrvèr cànnòt rèàd. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A ticket carries an unread count when someone other than the user has replied to it since the user last read it. [[#client-data]] **How a reply is counted as..." |
*
* @param {Demo_Narrative_Topic_Unread_Badges_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_unread_badges_body = /** @type {((inputs?: Demo_Narrative_Topic_Unread_Badges_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Unread_Badges_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_unread_badges_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_unread_badges_body(inputs)
	return en_demo_narrative_topic_unread_badges_body(inputs)
});