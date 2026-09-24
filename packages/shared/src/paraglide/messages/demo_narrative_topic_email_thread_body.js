/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Email_Thread_BodyInputs */

const en_demo_narrative_topic_email_thread_body = /** @type {(inputs: Demo_Narrative_Topic_Email_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Emails sent and received on a ticket appear in the same conversation thread as SMS messages, portal replies, and internal notes.
**Outbound emails.** When a volunteer sends an email from the compose bar, the thread shows the message with a subject line, the formatted body, and an Email chip labeling the channel. The compose sheet where the volunteer writes the email shows a plaintext warning banner because the message leaves the system unencrypted.
**Inbound emails.** When a client replies by email, the thread shows the claimed From address, the subject, and the plain text body. The From address is marked as unverified because the server cannot confirm the sender's identity. If the inbound email carried attachments, a notice below the body says how many were stripped, since email attachments are not imported into the encrypted store.
**Inbound caution.** An info button on each inbound email opens an expandable panel with the warning "This message arrived by email. Email is the easiest channel to fake. Check anything important in it before acting on it."
**Compose bar notice.** When the client's most recent message arrived by email, a caution appears above the compose bar warning that the client may be expecting an email reply and might not see an SMS or portal message. The caution can be dismissed and stays dismissed for that ticket for the rest of the session.
**Revoking the reply token.** The case panel shows a Revoke email reply token action when the client has an email address on file. Revoking the token stops emailed replies from landing in the thread, and a new token is created automatically on the next outbound email from a volunteer.`)
};

const es_demo_narrative_topic_email_thread_body = /** @type {(inputs: Demo_Narrative_Topic_Email_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los correos electrónicos enviados y recibidos en un ticket aparecen en el mismo hilo de conversación que los mensajes SMS, las respuestas del portal y las notas internas.
**Correos salientes.** Cuando un voluntario envía un correo electrónico desde la barra de composición, el hilo muestra el mensaje con una línea de asunto, el cuerpo formateado y una insignia de Email que identifica el canal. La hoja de composición donde el voluntario escribe el correo muestra un banner de advertencia de texto plano porque el mensaje sale del sistema sin cifrar.
**Correos entrantes.** Cuando un cliente responde por correo electrónico, el hilo muestra la dirección de remitente declarada, el asunto y el cuerpo en texto plano. La dirección de remitente aparece como no verificada porque el servidor no puede confirmar la identidad del remitente. Si el correo entrante llevaba archivos adjuntos, un aviso debajo del cuerpo indica cuántos fueron descartados, ya que los adjuntos de correo electrónico no se importan al almacén cifrado.
**Aviso de precaución.** Un botón de información en cada correo entrante abre un panel expandible con la advertencia "Este mensaje llegó por correo electrónico. El correo electrónico es el canal más fácil de falsificar. Comprueba cualquier dato importante antes de actuar."
**Aviso en la barra de composición.** Cuando el mensaje más reciente del cliente llegó por correo electrónico, aparece un aviso sobre la barra de composición advirtiendo que el cliente podría estar esperando una respuesta por correo y tal vez no vea un SMS o un mensaje del portal. El aviso se puede cerrar y permanece cerrado para ese ticket durante el resto de la sesión.
**Revocar el token de respuesta.** El panel del caso muestra una acción de Revocar token de respuesta por correo cuando el cliente tiene una dirección de correo electrónico registrada. Revocar el token impide que las respuestas enviadas por correo lleguen al hilo, y se crea un token nuevo automáticamente con el siguiente correo saliente de un voluntario.`)
};

const en_xa2_demo_narrative_topic_email_thread_body = /** @type {(inputs: Demo_Narrative_Topic_Email_Thread_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èmàìls sènt ànd rècèìvèd òn à tìckèt àppèàr ìn thè sàmè cònvèrsàtìòn thrèàd às SMS mèssàgès, pòrtàl rèplìès, ànd ìntèrnàl nòtès.
 •••••••••••••••••••••••••••••••••••••••**Òùtbòùnd èmàìls. •••••** Whèn à vòlùntèèr sènds àn èmàìl fròm thè còmpòsè bàr, thè thrèàd shòws thè mèssàgè wìth à sùbjèct lìnè, thè fòrmàttèd bòdy, ànd àn Èmàìl chìp làbèlìng thè chànnèl. Thè còmpòsè shèèt whèrè thè vòlùntèèr wrìtès thè èmàìl shòws à plàìntèxt wàrnìng bànnèr bècàùsè thè mèssàgè lèàvès thè systèm ùnèncryptèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìnbòùnd èmàìls. •••••** Whèn à clìènt rèplìès by èmàìl, thè thrèàd shòws thè clàìmèd Fròm àddrèss, thè sùbjèct, ànd thè plàìn tèxt bòdy. Thè Fròm àddrèss ìs màrkèd às ùnvèrìfìèd bècàùsè thè sèrvèr cànnòt cònfìrm thè sèndèr's ìdèntìty. Ìf thè ìnbòùnd èmàìl càrrìèd àttàchmènts, à nòtìcè bèlòw thè bòdy sàys hòw màny wèrè strìppèd, sìncè èmàìl àttàchmènts àrè nòt ìmpòrtèd ìntò thè èncryptèd stòrè.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ìnbòùnd càùtìòn. •••••** Àn ìnfò bùttòn òn èàch ìnbòùnd èmàìl òpèns àn èxpàndàblè pànèl wìth thè wàrnìng "Thìs mèssàgè àrrìvèd by èmàìl. Èmàìl ìs thè èàsìèst chànnèl tò fàkè. Chèck ànythìng ìmpòrtànt ìn ìt bèfòrè àctìng òn ìt."
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Còmpòsè bàr nòtìcè. ••••••** Whèn thè clìènt's mòst rècènt mèssàgè àrrìvèd by èmàìl, à càùtìòn àppèàrs àbòvè thè còmpòsè bàr wàrnìng thàt thè clìènt mày bè èxpèctìng àn èmàìl rèply ànd mìght nòt sèè àn SMS òr pòrtàl mèssàgè. Thè càùtìòn càn bè dìsmìssèd ànd stàys dìsmìssèd fòr thàt tìckèt fòr thè rèst òf thè sèssìòn.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Rèvòkìng thè rèply tòkèn. ••••••••** Thè càsè pànèl shòws à Rèvòkè èmàìl rèply tòkèn àctìòn whèn thè clìènt hàs àn èmàìl àddrèss òn fìlè. Rèvòkìng thè tòkèn stòps èmàìlèd rèplìès fròm làndìng ìn thè thrèàd, ànd à nèw tòkèn ìs crèàtèd àùtòmàtìcàlly òn thè nèxt òùtbòùnd èmàìl fròm à vòlùntèèr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Emails sent and received on a ticket appear in the same conversation thread as SMS messages, portal replies, and internal notes. **Outbound emails.** When a ..." |
*
* @param {Demo_Narrative_Topic_Email_Thread_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_email_thread_body = /** @type {((inputs?: Demo_Narrative_Topic_Email_Thread_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Email_Thread_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_email_thread_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_email_thread_body(inputs)
	return en_demo_narrative_topic_email_thread_body(inputs)
});