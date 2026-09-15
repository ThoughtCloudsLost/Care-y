/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_BodyInputs */

const en_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shift scheduling is planned to cover shifts that repeat on a schedule, assigning people to cover them, and a calendar showing where coverage is complete and where it is thin. Until it arrives, the shift summary on the overview page is filled from fixed placeholder values rather than from any schedule, so the times and initials it shows are the same for every user instead of describing anyone's real shift.`)
};

const es_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La programación de turnos está prevista para cubrir turnos que se repiten según un calendario, la asignación de las personas que los atienden y una vista de calendario que muestra dónde la cobertura está completa y dónde es escasa. Hasta que llegue, el resumen de turno de la página de resumen se rellena con valores fijos de marcador de posición y no con un horario real, así que los horarios y las iniciales que muestra son los mismos para todas las personas usuarias en lugar de describir el turno real de nadie.`)
};

/**
* | output |
* | --- |
* | "Shift scheduling is planned to cover shifts that repeat on a schedule, assigning people to cover them, and a calendar showing where coverage is complete and ..." |
*
* @param {Demo_Narrative_Schedule_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_body = /** @type {((inputs?: Demo_Narrative_Schedule_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Schedule_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_schedule_body(inputs)
	return en_demo_narrative_schedule_body(inputs)
});