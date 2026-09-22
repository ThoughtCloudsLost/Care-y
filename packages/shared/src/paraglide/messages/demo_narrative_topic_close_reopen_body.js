/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Close_Reopen_BodyInputs */

const en_demo_narrative_topic_close_reopen_body = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closing a case records that the work on it is finished, and reopening it puts it back in the working lists. [[#client-data #permissions]]
**What a close asks for first.** A case whose linked cases are still unresolved is refused rather than closed. A note type the organization marks as required at close is prompted for, one at a time, and each prompt can be passed over, so the requirement is a reminder and not a gate. A note written at that point is sealed with the case key like any other note. [Internal notes](#ticket-detail/notes) covers the types. [[#failure-states #encryption]]
**What closing changes on the server.** The case status becomes closed, a status entry is written to the thread, and every account's read marker for the case is deleted, so a closed case keeps no record of who had read how far. The status is a plaintext column, so a database dump shows which cases are closed and when each one closed. [Date separators and unread](#ticket-detail/date-separators) covers the marker. [[#server-holds #metadata #retention]]
**Reopening.** A reopen sets the status back to open and writes its own status entry. Closing and reopening are the same permission, and a case can be reopened long after it closed. [The permission system](#deep-dive/the-permission-system) covers that grant. [[#permissions]]
**When a closed case reopens itself.** A text or an email arriving from the client on a closed case reopens it before the message is written, so a client who comes back does not land in a case nobody is watching. One shared path does that for both channels. [Email on a case](#ticket-detail/email-thread) covers the inbound email route. [[#telephony #failure-states]]
**The close path and the reopen helper.** The prompts are \`create-close-resolution.svelte.ts\` in \`packages/client/src/lib/composables/ticket-detail/\` with \`CloseResolutionSheet.svelte\`, the close and reopen mutations are in \`packages/server/src/tickets/ticket-service.ts\`, the cursor deletion is wired in \`packages/server/src/routes/tickets.ts\`, and the automatic reopen is \`packages/server/src/tickets/ticket-reopen.ts\`. [[#client-data]]`)
};

const es_demo_narrative_topic_close_reopen_body = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrar un caso deja constancia de que el trabajo sobre él ha terminado, y reabrirlo lo devuelve a las listas de trabajo. [[#client-data #permissions]]
**Lo que pide un cierre antes de nada.** Un caso cuyos casos enlazados siguen sin resolver se rechaza en lugar de cerrarse. Un tipo de nota que la organización marca como obligatorio al cerrar se solicita, de uno en uno, y cada solicitud se puede omitir, de modo que el requisito es un recordatorio y no una barrera. Una nota escrita en ese momento se sella con la clave del caso como cualquier otra nota. [Notas internas](#ticket-detail/notes) trata los tipos. [[#failure-states #encryption]]
**Lo que cambia un cierre en el servidor.** El estado del caso pasa a cerrado, se escribe una entrada de estado en el hilo y se borra la marca de lectura de todas las cuentas para ese caso, de modo que un caso cerrado no conserva registro de quién había leído hasta dónde. El estado es una columna en texto plano, así que un volcado de la base de datos muestra qué casos están cerrados y cuándo se cerró cada uno. [Separadores de fecha y no leídos](#ticket-detail/date-separators) trata esa marca. [[#server-holds #metadata #retention]]
**Reabrir.** Una reapertura devuelve el estado a abierto y escribe su propia entrada de estado. Cerrar y reabrir son el mismo permiso, y un caso se puede reabrir mucho después de haberse cerrado. [El sistema de permisos](#deep-dive/the-permission-system) trata esa concesión. [[#permissions]]
**Cuando un caso cerrado se reabre solo.** Un mensaje de texto o un correo que llega del cliente a un caso cerrado lo reabre antes de escribir el mensaje, de modo que un cliente que vuelve no aterriza en un caso que nadie mira. Un mismo camino compartido hace eso para ambos canales. [El correo en un caso](#ticket-detail/email-thread) trata la vía del correo entrante. [[#telephony #failure-states]]
**El camino de cierre y el ayudante de reapertura.** Las solicitudes son \`create-close-resolution.svelte.ts\`, en \`packages/client/src/lib/composables/ticket-detail/\`, con \`CloseResolutionSheet.svelte\`; las mutaciones de cierre y reapertura están en \`packages/server/src/tickets/ticket-service.ts\`; el borrado de marcas se conecta en \`packages/server/src/routes/tickets.ts\`, y la reapertura automática es \`packages/server/src/tickets/ticket-reopen.ts\`. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_close_reopen_body = /** @type {(inputs: Demo_Narrative_Topic_Close_Reopen_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs càn clòsè à tìckèt whèn thè càsè ìs rèsòlvèd.
 ••••••••••••••••••**Rèsòlùtìòn nòtès. ••••••** Whèn clòsìng, thè systèm chècks whìch nòtè typès àrè màrkèd às rèqùìrèd òn clòsè. Ìf àny àrè, thè vòlùntèèr ìs stèppèd thròùgh thèm ònè àt à tìmè. Èàch stèp càn bè skìppèd. Ìf nò nòtè typès rèqùìrè nòtès àt clòsè, thè tìckèt clòsès ìmmèdìàtèly wìth nò pròmpt. Rèsòlùtìòn nòtès àrè èncryptèd wìth thè pèr tìckèt kèy bèfòrè stòràgè.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèòpènìng. •••** À clòsèd tìckèt càn bè rèòpènèd ìf thè càsè nèèds fùrthèr àttèntìòn. Rèòpènìng rèstòrès thè tìckèt tò àctìvè stàtùs ànd ìt rèàppèàrs ìn thè vòlùntèèr's wòrkìng lìsts. •••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Closing a case records that the work on it is finished, and reopening it puts it back in the working lists. [[#client-data #permissions]] **What a close asks..." |
*
* @param {Demo_Narrative_Topic_Close_Reopen_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_close_reopen_body = /** @type {((inputs?: Demo_Narrative_Topic_Close_Reopen_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Close_Reopen_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_close_reopen_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_close_reopen_body(inputs)
	return en_demo_narrative_topic_close_reopen_body(inputs)
});