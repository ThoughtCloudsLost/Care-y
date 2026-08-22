/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Needs_Attention_BodyInputs */

const en_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A per volunteer ticket list filtered to cases that need immediate action from that specific volunteer. Each volunteer sees only their own tickets that qualify.
**What qualifies.** A ticket appears here when it is open, not on hold, marked urgent or high priority, and either unassigned or assigned to the volunteer with unread replies.
**Visibility.** This section only appears on the overview page when at least one ticket qualifies. If all cases are up to date, the section is hidden entirely rather than showing an empty list.
**Purpose.** This is the first place volunteers should look when they open the app. It surfaces the most time sensitive work without requiring the volunteer to sort or filter the full ticket list manually.`)
};

const es_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una lista de tickets por voluntario filtrada a casos que necesitan acción inmediata de ese voluntario específico. Cada voluntario ve solo sus propios tickets que califican.
**Qué califica.** Un ticket aparece aquí cuando está abierto, no está en espera, está marcado como urgente o alta prioridad, y está sin asignar o asignado al voluntario con respuestas no leídas.
**Visibilidad.** Esta sección solo aparece en la página de resumen cuando al menos un ticket califica. Si todos los casos están al día, la sección se oculta completamente en lugar de mostrar una lista vacía.
**Propósito.** Este es el primer lugar donde los voluntarios deben mirar al abrir la aplicación. Muestra el trabajo más urgente sin que el voluntario tenga que ordenar o filtrar la lista completa de tickets manualmente.`)
};

/**
* | output |
* | --- |
* | "A per volunteer ticket list filtered to cases that need immediate action from that specific volunteer. Each volunteer sees only their own tickets that qualif..." |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_needs_attention_body(inputs)
	return es_demo_narrative_dashboard_needs_attention_body(inputs)
});