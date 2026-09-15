/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Correction_Status_BodyInputs */

const en_demo_narrative_topic_correction_status_body = /** @type {(inputs: Demo_Narrative_Topic_Correction_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a client updates their contact information through the portal, the change appears in the ticket thread as a flagged entry with a tinted background and an icon so it stands out from regular messages. The entry shows structured rows for each changed field, with labels and new values.
**Apply.** When the correction includes a phone number or email address, an Apply button next to that field opens the corresponding edit flow prefilled with the new value so a volunteer can update the client record in one tap rather than retyping it.
**Acknowledge.** A toggle button on the status line lets a volunteer mark the correction as handled. After toggling, the line shows the name of the volunteer who acknowledged it so the team knows who reviewed the change.
**Why it appears in the thread.** Contact corrections are follow-up events stored on the ticket, the same way calls and shares are, and placing them in the timeline lets the team see when the change happened relative to the conversation.`)
};

const es_demo_narrative_topic_correction_status_body = /** @type {(inputs: Demo_Narrative_Topic_Correction_Status_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un cliente actualiza su información de contacto a través del portal, el cambio aparece en el hilo del ticket como una entrada marcada con un fondo coloreado y un icono para que se destaque de los mensajes regulares. La entrada muestra filas estructuradas para cada campo modificado, con etiquetas y valores nuevos.
**Aplicar.** Cuando la corrección incluye un número de teléfono o dirección de correo electrónico, un botón Aplicar junto a ese campo abre el flujo de edición correspondiente prellenado con el valor nuevo para que un voluntario pueda actualizar el registro del cliente en un solo toque en lugar de volver a escribirlo.
**Confirmar.** Un botón de alternancia en la línea de estado permite que un voluntario marque la corrección como gestionada. Después de activarlo, la línea muestra el nombre del voluntario que confirmó para que el equipo sepa quién revisó el cambio.
**Por qué aparece en el hilo.** Las correcciones de contacto son eventos de seguimiento almacenados en el ticket, de la misma forma que las llamadas y los enlaces compartidos, y colocarlas en la línea de tiempo permite que el equipo vea cuándo ocurrió el cambio en relación a la conversación.`)
};

/**
* | output |
* | --- |
* | "When a client updates their contact information through the portal, the change appears in the ticket thread as a flagged entry with a tinted background and a..." |
*
* @param {Demo_Narrative_Topic_Correction_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_correction_status_body = /** @type {((inputs?: Demo_Narrative_Topic_Correction_Status_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Correction_Status_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_correction_status_body(inputs)
	return en_demo_narrative_topic_correction_status_body(inputs)
});