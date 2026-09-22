/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Decryption_BodyInputs */

const en_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The browser opens a ticket's title with a key wrapped for the signed-in account, and the server holds the ciphertext and that wrap without being able to use either. [[#encryption #keys]]
**Who holds a ticket's key.** Every ticket carries a key of its own, and a separate sealed copy of that key exists for each account permitted to read the ticket, one row per ticket, account and key generation. A ticket opened from an intake form carries an interim copy sealed to the organization instead, which the browser unseals until the per-account copies are minted. [How encryption works](#deep-dive/how-encryption-works) covers the hierarchy those keys hang from. [[#keys #encryption]]
**What a row without a key shows.** A ticket in a queue the account has access to whose key was never wrapped for it lists with its plaintext fields, which are the queue, the priority, the status, the assignee and the times, and no title. Joining a queue registers the queue's existing tickets as pending, and the next teammate who already holds those keys re-wraps them on their next sign-in, paced against idle time and resumable, so closing the browser part-way through costs nothing but the remainder. [[#failure-states #keys]]
**What the session keeps.** A title stays decrypted in a browser-side map for the rest of the session, so returning to the list asks the worker for nothing it has already answered. Every map holding decrypted content is registered in one place and wiped together when the idle timer zeroes keys and when the page closes, and nothing derived from a decrypt is sent back. [[#client-data #privacy]]
**The decrypt caches and the backfill sweep.** \`TicketDecryptCache\` in \`packages/client/src/lib/crypto/ticket-decrypt-cache.ts\` fires each decrypt into the crypto worker and writes the result into a registry-tracked map, the wrap rows are \`025_create_ticket_key_wraps.ts\`, and the backfill is \`packages/client/src/lib/crypto/wrap-backfill-sweep.svelte.ts\` against \`packages/server/src/tickets/wrap-backfill-service.ts\`. [Creating a new ticket](#tickets/new-ticket) covers which accounts get a wrap at creation. [[#encryption]]`)
};

const es_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El navegador abre el título de un ticket con una clave envuelta para la cuenta que ha iniciado sesión, y el servidor guarda el texto cifrado y ese envoltorio sin poder usar ninguno de los dos. [[#encryption #keys]]
**Quién tiene la clave de un ticket.** Cada ticket lleva una clave propia, y existe una copia sellada aparte de esa clave para cada cuenta con permiso para leer el ticket, una fila por ticket, cuenta y generación de clave. Un ticket abierto desde un formulario de admisión lleva en su lugar una copia provisional sellada para la organización, que el navegador abre hasta que se acuñan las copias por cuenta. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la jerarquía de la que cuelgan esas claves. [[#keys #encryption]]
**Qué muestra una fila sin clave.** Un ticket de una cola a la que la cuenta tiene acceso y cuya clave nunca se envolvió para ella figura en la lista con sus campos en claro, que son la cola, la prioridad, el estado, la persona asignada y las fechas, y sin título. Entrar en una cola registra como pendientes los tickets que ya tiene esa cola, y la siguiente persona del equipo que ya posea esas claves las vuelve a envolver en su siguiente inicio de sesión, al ritmo de los momentos de inactividad y de forma reanudable, así que cerrar el navegador a medias no cuesta más que lo que quede. [[#failure-states #keys]]
**Qué conserva la sesión.** Un título permanece descifrado en un mapa del navegador durante el resto de la sesión, de modo que volver a la lista no le pide al worker nada que ya haya respondido. Todos los mapas que guardan contenido descifrado están registrados en un mismo sitio y se borran a la vez cuando el temporizador de inactividad pone las claves a cero y cuando se cierra la página, y nada derivado de un descifrado se devuelve al servidor. [[#client-data #privacy]]
**Las cachés de descifrado y el barrido de reenvoltura.** \`TicketDecryptCache\`, en \`packages/client/src/lib/crypto/ticket-decrypt-cache.ts\`, lanza cada descifrado al worker criptográfico y escribe el resultado en un mapa registrado, las filas de envoltorio son \`025_create_ticket_key_wraps.ts\`, y el barrido es \`packages/client/src/lib/crypto/wrap-backfill-sweep.svelte.ts\` contra \`packages/server/src/tickets/wrap-backfill-service.ts\`. [Creando un nuevo ticket](#tickets/new-ticket) trata qué cuentas reciben un envoltorio al crearlo. [[#encryption]]`)
};

const en_xa2_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèt tìtlès àrè stòrèd às cìphèrtèxt òn thè sèrvèr. Thè bròwsèr fètchès ànd dècrypts èàch tìtlè lòcàlly ùsìng thè vòlùntèèr's èncryptìòn kèys.
 ••••••••••••••••••••••••••••••••••••••••••••**Pèrfòrmàncè. ••••** Tìckèts thàt hàvè àlrèàdy bèèn dècryptèd dùrìng thè cùrrènt sèssìòn àrè càchèd ìn thè bròwsèr's mèmòry, sò rèvìsìtìng thè lìst shòws thèm ìnstàntly wìthòùt rè-dècryptìng. ••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The browser opens a ticket's title with a key wrapped for the signed-in account, and the server holds the ciphertext and that wrap without being able to use ..." |
*
* @param {Demo_Narrative_Topic_Decryption_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_decryption_body = /** @type {((inputs?: Demo_Narrative_Topic_Decryption_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Decryption_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_decryption_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_decryption_body(inputs)
	return en_demo_narrative_topic_decryption_body(inputs)
});