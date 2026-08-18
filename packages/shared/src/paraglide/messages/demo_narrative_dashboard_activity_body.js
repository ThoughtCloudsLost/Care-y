/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Activity_BodyInputs */

const en_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A chronological list of recent events across the organization. Events include new tickets, status changes, assignments, and messages.
**Encryption.** The client alias and queue name in each event are encrypted with the organization key. They only appear as readable text after the browser decrypts them at display time. Structural metadata like the event type, ticket ID, and timestamp are not encrypted because the server needs them to sort and filter the feed.
**What this means for volunteers.** The activity feed gives a quick overview of what is happening across the organization without needing to open individual items. Tapping an event navigates to the relevant item.`)
};

const es_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una lista cronologica de eventos recientes en toda la organizacion. Los eventos incluyen nuevos tickets, cambios de estado, asignaciones y mensajes.
**Cifrado.** El alias del cliente y el nombre de la cola en cada evento estan cifrados con la clave de la organizacion. Solo aparecen como texto legible despues de que el navegador los descifra. Los metadatos estructurales como el tipo de evento, el ID del ticket y la marca de tiempo no estan cifrados porque el servidor los necesita para ordenar y filtrar el feed.
**Lo que esto significa para los voluntarios.** El feed de actividad ofrece una vision rapida de lo que esta pasando en la organizacion sin necesidad de abrir tickets individuales. Tocar un evento navega al elemento correspondiente.`)
};

/**
* | output |
* | --- |
* | "A chronological list of recent events across the organization. Events include new tickets, status changes, assignments, and messages. **Encryption.** The cli..." |
*
* @param {Demo_Narrative_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Activity_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Activity_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_activity_body(inputs)
	return es_demo_narrative_dashboard_activity_body(inputs)
});