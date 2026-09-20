/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_HeadingInputs */

const en_demo_narrative_schedule_heading = /** @type {(inputs: Demo_Narrative_Schedule_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shift scheduling`)
};

const es_demo_narrative_schedule_heading = /** @type {(inputs: Demo_Narrative_Schedule_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Programación de turnos`)
};

const en_xa2_demo_narrative_schedule_heading = /** @type {(inputs: Demo_Narrative_Schedule_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Shìft schèdùlìng •••••⟧`)
};

/**
* | output |
* | --- |
* | "Shift scheduling" |
*
* @param {Demo_Narrative_Schedule_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_heading = /** @type {((inputs?: Demo_Narrative_Schedule_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Schedule_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_schedule_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_schedule_heading(inputs)
	return en_demo_narrative_schedule_heading(inputs)
});