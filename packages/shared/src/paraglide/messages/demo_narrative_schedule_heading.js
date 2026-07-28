/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_HeadingInputs */

const en_demo_narrative_schedule_heading = /** @type {(inputs: Demo_Narrative_Schedule_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shift scheduling (coming soon)`)
};

const es_demo_narrative_schedule_heading = /** @type {(inputs: Demo_Narrative_Schedule_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Programacion de turnos (proximamente)`)
};

/**
* | output |
* | --- |
* | "Shift scheduling (coming soon)" |
*
* @param {Demo_Narrative_Schedule_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_heading = /** @type {((inputs?: Demo_Narrative_Schedule_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Schedule_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_schedule_heading(inputs)
	return es_demo_narrative_schedule_heading(inputs)
});