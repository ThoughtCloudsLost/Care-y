/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Call_Log_BodyInputs */

const en_demo_narrative_topic_call_log_body = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A call placed or received on a case is recorded in the thread with its outcome, and a connected call carries how long it ran. [[#telephony #client-data]]
**What a call entry is made of.** The outcome and the duration are plaintext columns on the entry, and the entry carries no sealed content, because the words of a call are never in the system to seal. A database dump therefore shows that a case had a six-minute call at a given hour and which account was on it, and nothing of what was said. [The trust boundary](#deep-dive/the-trust-boundary) lists what else a dump reaches. [[#metadata #server-holds]]
**Where the number comes from.** The browser asks for a call by naming the case, and the server resolves and decrypts the client's number itself, so the number is not in the request and not in the tab. The one number the browser does hold is the user's own verified callback number, for the option that rings their phone instead of the tab. [The telephony relay](#deep-dive/the-telephony-relay) covers what the provider sees once a call is placed. [[#telephony #privacy #server-holds]]
**What the provider is left holding.** A call is matched back to its case through a table of provider call identifiers that expires an hour after the call, and once a voicemail recording has been stored the provider is asked to delete both the recording and the call log. A delete the provider refuses is queued and retried rather than dropped. [Data retention](#deep-dive/data-retention) covers the queue that carries those retries. [[#retention #telephony]]
**Before a call is placed.** The user is told once per session that the call goes through a phone company that can hear it, and a case carrying an unacknowledged contact correction says so on the same sheet. [Exposure notices](#ticket-detail/exposure-hints) covers when each notice is raised. [[#privacy #telephony]]
**The status webhook and the tracker.** The entry is written by \`handleCallStatus\` in \`packages/server/src/telephony/call-status-handler.ts\` when the provider reports a terminal status, from the columns added in \`065_add_call_metadata.ts\`, and the case context it needs comes from the \`tracked_calls\` row of \`082_create_tracked_calls.ts\`. The label is built in \`packages/client/src/lib/tickets/call-label.ts\`, shared by the thread and the timeline. [[#client-data]]`)
};

const es_demo_narrative_topic_call_log_body = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una llamada hecha o recibida en un caso queda registrada en el hilo con su resultado, y una llamada que se estableció indica cuánto duró. [[#telephony #client-data]]
**De qué se compone una entrada de llamada.** El resultado y la duración son columnas en texto plano de la entrada, y la entrada no lleva contenido sellado, porque las palabras de una llamada nunca están en el sistema para sellarlas. Un volcado de la base de datos muestra por tanto que un caso tuvo una llamada de seis minutos a cierta hora y qué cuenta estuvo en ella, y nada de lo que se dijo. [La frontera de confianza](#deep-dive/the-trust-boundary) enumera lo demás que alcanza un volcado. [[#metadata #server-holds]]
**De dónde sale el número.** El navegador pide una llamada nombrando el caso, y el servidor resuelve y descifra por su cuenta el número del cliente, así que el número no está en la petición ni en la pestaña. El único número que sí tiene el navegador es el de devolución de llamada verificado de la persona usuaria, para la opción que hace sonar su teléfono en lugar de la pestaña. [El relé de telefonía](#deep-dive/the-telephony-relay) trata lo que ve el proveedor una vez hecha la llamada. [[#telephony #privacy #server-holds]]
**Lo que le queda al proveedor.** Una llamada se vuelve a asociar a su caso mediante una tabla de identificadores de llamada del proveedor que caduca una hora después, y una vez guardada la grabación de un mensaje de voz se le pide al proveedor que borre tanto la grabación como el registro de la llamada. Un borrado que el proveedor rechaza se encola y se reintenta en lugar de abandonarse. [Retención de datos](#deep-dive/data-retention) trata la cola que lleva esos reintentos. [[#retention #telephony]]
**Antes de hacer una llamada.** A la persona usuaria se le indica una vez por sesión que la llamada pasa por una compañía telefónica que puede oírla, y un caso que lleva una corrección de contacto sin atender lo señala en la misma hoja. [Avisos de exposición](#ticket-detail/exposure-hints) trata cuándo se levanta cada aviso. [[#privacy #telephony]]
**El webhook de estado y el rastreador.** La entrada la escribe \`handleCallStatus\`, en \`packages/server/src/telephony/call-status-handler.ts\`, cuando el proveedor informa de un estado final, a partir de las columnas añadidas en \`065_add_call_metadata.ts\`, y el contexto del caso que necesita viene de la fila de \`tracked_calls\` de \`082_create_tracked_calls.ts\`. La etiqueta se arma en \`packages/client/src/lib/tickets/call-label.ts\`, compartida por el hilo y la línea de tiempo. [[#client-data]]`)
};

const en_xa2_demo_narrative_topic_call_log_body = /** @type {(inputs: Demo_Narrative_Topic_Call_Log_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvèry càll àttèmpt bètwèèn à vòlùntèèr ànd à clìènt ìs lòggèd ìn thè thrèàd wìth ìts òùtcòmè sò thè hìstòry òf rèàchìng à clìènt stàys vìsìblè ìnsìdè thè càsè rècòrd. Còmplètèd càlls shòw thè dìrèctìòn ànd dùràtìòn whìlè ùnànswèrèd àttèmpts àrè rècòrdèd sèpàràtèly, ànd thè èntrìès sìt ìnlìnè bètwèèn thè mèssàgès sò à vòlùntèèr rètùrnìng tò thè tìckèt càn rèàd thè fùll còmmùnìcàtìòn hìstòry ìn òrdèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A call placed or received on a case is recorded in the thread with its outcome, and a connected call carries how long it ran. [[#telephony #client-data]] **W..." |
*
* @param {Demo_Narrative_Topic_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_call_log_body = /** @type {((inputs?: Demo_Narrative_Topic_Call_Log_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Call_Log_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_call_log_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_call_log_body(inputs)
	return en_demo_narrative_topic_call_log_body(inputs)
});