/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Shift_BodyInputs */

const en_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The shift card shows the current or upcoming shift for the signed-in volunteer.
**During a shift.** The card displays start and end times, a countdown, and the number of open tickets assigned. Chips show all volunteers currently on shift.
**Before or after a shift.** A countdown appears before one begins. When no shift is active or upcoming, a notice takes its place.
**Shift scheduling.** The scheduling feature that manages shift creation is still in development.`)
};

const es_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La tarjeta de turno muestra el turno actual o próximo del voluntario con sesión iniciada.
**Durante un turno.** La tarjeta muestra las horas de inicio y fin, una cuenta regresiva y la cantidad de tickets abiertos asignados. Chips muestran a todos los voluntarios actualmente en turno.
**Antes o después de un turno.** Una cuenta regresiva aparece antes de que comience uno. Cuando no hay turno activo ni próximo, un aviso ocupa su lugar.
**Programación de turnos.** La función de programación que gestiona la creación de turnos aún está en desarrollo.`)
};

/**
* | output |
* | --- |
* | "The shift card shows the current or upcoming shift for the signed-in volunteer. **During a shift.** The card displays start and end times, a countdown, and t..." |
*
* @param {Demo_Narrative_Dashboard_Shift_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_shift_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Shift_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Shift_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_shift_body(inputs)
	return en_demo_narrative_dashboard_shift_body(inputs)
});