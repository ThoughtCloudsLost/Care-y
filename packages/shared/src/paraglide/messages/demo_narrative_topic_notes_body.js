/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Notes_BodyInputs */

const en_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notes are visible only to volunteers and are encrypted with the same per ticket key as messages. The server cannot distinguish a note from a client message because both are stored as identical ciphertext. Only the volunteer's browser knows which entries are notes.
**Note types.** Each note is tagged with a type. The four defaults are Comment for general observations, Resolution for documenting how the ticket was resolved and prompted on close, Safety Concern for flagging risk to someone's wellbeing with notifications to admins and managers, and Request for asking for additional resources with notifications to admins and managers. Administrators can create additional types from the admin settings.
**Visibility.** Note types have a minimum view role setting. A note type restricted to managers or above is invisible to regular volunteers. The server filters notes by role before returning them, so restricted notes never reach the browser of a volunteer below the threshold. The note author can always see their own notes regardless of role.
**Reactions.** Volunteers can add reactions to notes. Five reaction types are available: acknowledge, approve, disagree, flag, and complete. Reactions are plaintext metadata visible to all volunteers who can see the note. They are not available on client messages.`)
};

const es_demo_narrative_topic_notes_body = /** @type {(inputs: Demo_Narrative_Topic_Notes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las notas solo son visibles para voluntarios y se cifran con la misma clave por ticket que los mensajes. El servidor no puede distinguir una nota de un mensaje del cliente porque ambos se almacenan como texto cifrado identico. Solo el navegador del voluntario sabe cuales entradas son notas.
**Tipos de nota.** Cada nota se etiqueta con un tipo. Los cuatro predeterminados son Comentario para observaciones generales, Resolucion para documentar como se resolvio el ticket y que se solicita al cerrar, Preocupacion de Seguridad para senalar riesgo para el bienestar de alguien con notificacion a administradores y gestores, y Solicitud para pedir recursos adicionales con notificacion a administradores y gestores. Los administradores pueden crear tipos adicionales desde la configuracion.
**Visibilidad.** Los tipos de nota tienen una configuracion de rol minimo de visualizacion. Un tipo de nota restringido a gestores o superiores es invisible para voluntarios regulares. El servidor filtra las notas por rol antes de devolverlas, por lo que las notas restringidas nunca llegan al navegador de un voluntario por debajo del umbral. El autor de la nota siempre puede ver sus propias notas independientemente del rol.
**Reacciones.** Los voluntarios pueden anadir reacciones a las notas. Cinco tipos de reaccion estan disponibles: reconocer, aprobar, discrepar, marcar y completar. Las reacciones son metadatos en texto plano visibles para todos los voluntarios que pueden ver la nota. No estan disponibles en mensajes del cliente.`)
};

/**
* | output |
* | --- |
* | "Notes are visible only to volunteers and are encrypted with the same per ticket key as messages. The server cannot distinguish a note from a client message b..." |
*
* @param {Demo_Narrative_Topic_Notes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_notes_body = /** @type {((inputs?: Demo_Narrative_Topic_Notes_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Notes_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_notes_body(inputs)
	return es_demo_narrative_topic_notes_body(inputs)
});