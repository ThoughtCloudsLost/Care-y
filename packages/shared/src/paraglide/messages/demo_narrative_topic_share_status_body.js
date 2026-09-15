/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Share_Status_BodyInputs */

const en_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A small status line appears beneath each share link message in the ticket thread. It shows the link icon, the label "Share link," and the current status.
**States.** The three states are waiting (the recipient has not opened the link), opened (the recipient viewed the content), and expired (the time window closed before the link was opened). The status updates from the server's share record without the volunteer having to open the link or contact the recipient.`)
};

const es_demo_narrative_topic_share_status_body = /** @type {(inputs: Demo_Narrative_Topic_Share_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una pequeña línea de estado aparece debajo de cada mensaje de enlace compartido en el hilo del ticket. Muestra el icono de enlace, la etiqueta "Enlace compartido" y el estado actual.
**Estados.** Los tres estados son esperando (el destinatario no ha abierto el enlace), abierto (el destinatario vio el contenido) y expirado (la ventana de tiempo se cerró antes de que se abriera el enlace). El estado se actualiza desde el registro de compartición del servidor sin que el voluntario tenga que abrir el enlace o contactar al destinatario.`)
};

/**
* | output |
* | --- |
* | "A small status line appears beneath each share link message in the ticket thread. It shows the link icon, the label \"Share link,\" and the current status. **S..." |
*
* @param {Demo_Narrative_Topic_Share_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_status_body = /** @type {((inputs?: Demo_Narrative_Topic_Share_Status_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Share_Status_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_share_status_body(inputs)
	return en_demo_narrative_topic_share_status_body(inputs)
});