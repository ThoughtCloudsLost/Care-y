/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_New_Ticket_BodyInputs */

const en_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opening a ticket seals its title and description in the browser under a key minted there, and the server files the ciphertext without ever holding the key. [[#encryption #keys]]
**One ticket per client at a time.** Before anything is encrypted the browser asks which ticket a creation for this client would land on. An open ticket blocks the creation and the form hands the user to that ticket instead. A closed one is reopened under its existing identifier with a fresh key generation. The identifier is settled first because it is bound into what gets encrypted, so a stale answer is refused rather than filed against the wrong ticket. [Closing and reopening](#ticket-detail/close-reopen) covers the reopened side. [[#failure-states #keys]]
**Who can read it afterwards.** The key is wrapped at creation for the account opening the ticket and for every active onboarded member of the destination queue, which is the same set the intake path wraps for. Somebody who joins that queue later holds no wrap yet and receives one through the backfill a teammate's client runs. [Ticket decryption](#tickets/decryption) covers both paths. [[#keys #permissions]]
**What the form asks for and what the server checks.** A title, a queue and a client are required; a description is optional and the priority starts at normal. The server accepts the creation from an account with permission to open cases, and refuses a queue that is inactive or absent and a client record that is absent or already merged into another. [[#permissions]]
**What the new row holds in plaintext.** The queue, the priority, the status, the key generation and the creation time, beside the two ciphertext columns and the client reference. A database dump gains a ticket that exists, in a queue, at a priority, at a time, and neither its title nor its description nor who it concerns. [The trust boundary](#deep-dive/the-trust-boundary) sets out the row. [[#server-holds #metadata]]
**The creation path.** The form is \`NewTicketForm.svelte\` in \`packages/client/src/lib/components/tickets/\`, which fetches the destination queue's member keys, asks the crypto worker for one sealed copy per recipient and submits them together, and the server side is \`create\` in \`packages/server/src/tickets/ticket-service.ts\`, where the row and its wraps are written in one transaction. [[#encryption]]`)
};

const es_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir un ticket sella su título y su descripción en el navegador con una clave acuñada allí, y el servidor archiva el texto cifrado sin llegar a tener la clave. [[#encryption #keys]]
**Un ticket por cliente a la vez.** Antes de cifrar nada, el navegador pregunta sobre qué ticket recaería una creación para ese cliente. Un ticket abierto bloquea la creación y el formulario lleva a la persona usuaria a ese ticket. Uno cerrado se reabre con su identificador existente y una nueva generación de clave. El identificador se fija primero porque queda ligado a lo que se cifra, así que una respuesta desfasada se rechaza en lugar de archivarse en el ticket equivocado. [Cerrar y reabrir](#ticket-detail/close-reopen) trata el lado de la reapertura. [[#failure-states #keys]]
**Quién puede leerlo después.** La clave se envuelve al crear el ticket para la cuenta que lo abre y para cada miembro activo y con alta completada de la cola de destino, que es el mismo conjunto para el que envuelve la vía de admisión. Quien entre en esa cola más tarde todavía no tiene envoltorio y recibe uno mediante la reenvoltura que ejecuta el cliente de una persona del equipo. [Descifrado de tickets](#tickets/decryption) trata las dos vías. [[#keys #permissions]]
**Qué pide el formulario y qué comprueba el servidor.** Se exigen un título, una cola y un cliente; la descripción es opcional y la prioridad empieza en normal. El servidor acepta la creación de una cuenta con permiso para abrir casos, y rechaza una cola inactiva o inexistente y un registro de cliente inexistente o ya fusionado con otro. [[#permissions]]
**Qué guarda en texto plano la fila nueva.** La cola, la prioridad, el estado, la generación de clave y la fecha de creación, junto a las dos columnas cifradas y la referencia al cliente. Un volcado de la base de datos gana un ticket que existe, en una cola, con una prioridad y en una fecha, y ni su título ni su descripción ni a quién se refiere. [La frontera de confianza](#deep-dive/the-trust-boundary) expone la fila. [[#server-holds #metadata]]
**La ruta de creación.** El formulario es \`NewTicketForm.svelte\`, en \`packages/client/src/lib/components/tickets/\`, que obtiene las claves de los miembros de la cola de destino, pide al worker criptográfico una copia sellada por destinatario y las envía juntas, y el lado del servidor es \`create\`, en \`packages/server/src/tickets/ticket-service.ts\`, donde la fila y sus envoltorios se escriben en una sola transacción. [[#encryption]]`)
};

const en_xa2_demo_narrative_topic_new_ticket_body = /** @type {(inputs: Demo_Narrative_Topic_New_Ticket_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn à vòlùntèèr crèàtès à tìckèt, thè tìtlè ànd dèscrìptìòn àrè èncryptèd ìn thè bròwsèr bèfòrè thèy lèàvè thè dèvìcè. Thè sèrvèr stòrès thè cìphèrtèxt ànd àssìgns à tìckèt ÌD wìthòùt rèàdìng thè còntènt.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèqùìrèd fìèlds. •••••** À nèw tìckèt nèèds à tìtlè, à qùèùè àssìgnmènt, ànd à clìènt àt mìnìmùm. Dèscrìptìòn ìs òptìònàl ànd prìòrìty dèfàùlts tò nòrmàl.
 ••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Àll vòlùntèèrs càn crèàtè tìckèts by dèfàùlt, thìs càn bè chàngèd pèr òrg òn thè àdmìn pàgès. Qùèùè àssìgnmènt ìs lìmìtèd tò qùèùès thè vòlùntèèr hàs àccèss tò. •••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Opening a ticket seals its title and description in the browser under a key minted there, and the server files the ciphertext without ever holding the key. [..." |
*
* @param {Demo_Narrative_Topic_New_Ticket_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_new_ticket_body = /** @type {((inputs?: Demo_Narrative_Topic_New_Ticket_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_New_Ticket_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_new_ticket_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_new_ticket_body(inputs)
	return en_demo_narrative_topic_new_ticket_body(inputs)
});