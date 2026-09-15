/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Schedule_DescInputs */

const en_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shift scheduling is in development, and the schedule page carries a placeholder instead of a calendar.`)
};

const es_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La programación de turnos está en desarrollo, y la página de horarios muestra un marcador de posición en lugar de un calendario.`)
};

/**
* | output |
* | --- |
* | "Shift scheduling is in development, and the schedule page carries a placeholder instead of a calendar." |
*
* @param {Demo_Section_Schedule_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_schedule_desc = /** @type {((inputs?: Demo_Section_Schedule_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Schedule_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_schedule_desc(inputs)
	return en_demo_section_schedule_desc(inputs)
});