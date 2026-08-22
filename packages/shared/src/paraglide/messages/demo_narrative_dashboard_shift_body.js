/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Shift_BodyInputs */

const en_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The shift card shows the volunteer's current or upcoming shift.
**During a shift,** the card displays start and end times and a countdown to the end of the shift. It also shows how many open tickets are currently assigned to the volunteer.
**Before a shift,** the card shows a countdown to the start time.
**After a shift ends** or when no shift is scheduled, the card shows a notice. The scheduling feature that manages shift creation is still in development.
**On the card.** Initial chips show the volunteers currently on shift, and an end shift button is present.`)
};

const es_demo_narrative_dashboard_shift_body = /** @type {(inputs: Demo_Narrative_Dashboard_Shift_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La tarjeta de turno muestra el turno actual o próximo del voluntario.
**Durante un turno,** la tarjeta muestra las horas de inicio y fin y una cuenta regresiva hasta el final del turno. También muestra cuántos tickets abiertos están asignados actualmente al voluntario.
**Antes de un turno,** la tarjeta muestra una cuenta regresiva hasta la hora de inicio.
**Después de que termina un turno** o cuando no hay turno programado, la tarjeta muestra un aviso. La función de programación que gestiona la creación de turnos aún está en desarrollo.
**En la tarjeta.** Chips iniciales muestran los voluntarios actualmente en turno, y un botón de terminar turno está presente.`)
};

/**
* | output |
* | --- |
* | "The shift card shows the volunteer's current or upcoming shift. **During a shift,** the card displays start and end times and a countdown to the end of the s..." |
*
* @param {Demo_Narrative_Dashboard_Shift_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_shift_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Shift_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Shift_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_shift_body(inputs)
	return es_demo_narrative_dashboard_shift_body(inputs)
});