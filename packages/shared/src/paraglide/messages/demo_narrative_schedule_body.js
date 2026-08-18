/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_BodyInputs */

const en_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This page will let managers create and assign volunteer shifts. Shift start and end times, coverage requirements, and volunteer availability will be managed here. The shift summary card on the dashboard already reads from the shift data structure, and the card will show real data once scheduling is complete.`)
};

const es_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta pagina permitira a los gestores crear y asignar turnos de voluntarios. Los horarios de inicio y fin de turno, requisitos de cobertura y disponibilidad de voluntarios se gestionaran aqui. La tarjeta de resumen de turno en el panel principal ya lee de la estructura de datos de turnos, y la tarjeta mostrara datos reales cuando la programacion este completa.`)
};

/**
* | output |
* | --- |
* | "This page will let managers create and assign volunteer shifts. Shift start and end times, coverage requirements, and volunteer availability will be managed ..." |
*
* @param {Demo_Narrative_Schedule_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_body = /** @type {((inputs?: Demo_Narrative_Schedule_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Schedule_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_schedule_body(inputs)
	return es_demo_narrative_schedule_body(inputs)
});