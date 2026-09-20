/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Activity_BodyInputs */

const en_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A chronological list of recent events: new tickets, status changes, and assignments.
**Visibility.** The feed is scoped to queues the current volunteer can access. Volunteers with different queue memberships see different activity feeds.
**Encryption.** Client aliases and queue names in each event are encrypted with the organization key and decrypted in the browser at display time. Structural metadata (event type, ticket ID, timestamp) is not encrypted because the server needs it to sort and filter results.`)
};

const es_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una lista cronológica de eventos recientes: nuevos tickets, cambios de estado y asignaciones.
**Visibilidad.** El feed está limitado a las colas a las que el voluntario actual tiene acceso. Voluntarios con diferentes membresías de colas ven feeds distintos.
**Cifrado.** Los alias de clientes y los nombres de colas en cada evento están cifrados con la clave de la organización y se descifran en el navegador. Los metadatos estructurales (tipo de evento, ID del ticket, marca de tiempo) no están cifrados porque el servidor los necesita para ordenar y filtrar resultados.`)
};

const en_xa2_demo_narrative_dashboard_activity_body = /** @type {(inputs: Demo_Narrative_Dashboard_Activity_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À chrònòlògìcàl lìst òf rècènt èvènts: nèw tìckèts, stàtùs chàngès, ànd àssìgnmènts.
 ••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè fèèd ìs scòpèd tò qùèùès thè cùrrènt vòlùntèèr càn àccèss. Vòlùntèèrs wìth dìffèrènt qùèùè mèmbèrshìps sèè dìffèrènt àctìvìty fèèds.
 ••••••••••••••••••••••••••••••••••••••••••**Èncryptìòn. ••••** Clìènt àlìàsès ànd qùèùè nàmès ìn èàch èvènt àrè èncryptèd wìth thè òrgànìzàtìòn kèy ànd dècryptèd ìn thè bròwsèr àt dìsplày tìmè. Strùctùràl mètàdàtà (èvènt typè, tìckèt ÌD, tìmèstàmp) ìs nòt èncryptèd bècàùsè thè sèrvèr nèèds ìt tò sòrt ànd fìltèr rèsùlts. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A chronological list of recent events: new tickets, status changes, and assignments. **Visibility.** The feed is scoped to queues the current volunteer can a..." |
*
* @param {Demo_Narrative_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Activity_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Activity_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_activity_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_activity_body(inputs)
	return en_demo_narrative_dashboard_activity_body(inputs)
});