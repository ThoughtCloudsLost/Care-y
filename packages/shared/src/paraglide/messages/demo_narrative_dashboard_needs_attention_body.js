/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Needs_Attention_BodyInputs */

const en_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A per-volunteer list of tickets needing immediate action.
**What qualifies.** A ticket appears here when it is open, not on hold, marked urgent or high priority, and either unassigned or assigned to the current volunteer with unread replies.
**Visibility.** The section only appears when at least one ticket qualifies. Otherwise it is hidden entirely.`)
};

const es_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una lista por voluntario de tickets que necesitan acción inmediata.
**Qué califica.** Un ticket aparece aquí cuando está abierto, no está en espera, marcado como urgente o alta prioridad, y sin asignar o asignado al voluntario actual con respuestas no leídas.
**Visibilidad.** La sección solo aparece cuando al menos un ticket califica. De lo contrario, se oculta completamente.`)
};

const en_xa2_demo_narrative_dashboard_needs_attention_body = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À pèr-vòlùntèèr lìst òf tìckèts nèèdìng ìmmèdìàtè àctìòn.
 ••••••••••••••••••**Whàt qùàlìfìès. •••••** À tìckèt àppèàrs hèrè whèn ìt ìs òpèn, nòt òn hòld, màrkèd ùrgènt òr hìgh prìòrìty, ànd èìthèr ùnàssìgnèd òr àssìgnèd tò thè cùrrènt vòlùntèèr wìth ùnrèàd rèplìès.
 ••••••••••••••••••••••••••••••••••••••••••••••••••**Vìsìbìlìty. ••••** Thè sèctìòn ònly àppèàrs whèn àt lèàst ònè tìckèt qùàlìfìès. Òthèrwìsè ìt ìs hìddèn èntìrèly. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "A per-volunteer list of tickets needing immediate action. **What qualifies.** A ticket appears here when it is open, not on hold, marked urgent or high prior..." |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_needs_attention_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_needs_attention_body(inputs)
	return en_demo_narrative_dashboard_needs_attention_body(inputs)
});