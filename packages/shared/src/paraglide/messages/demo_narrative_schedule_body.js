/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_BodyInputs */

const en_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This page will let managers create and assign shifts. The scheduling feature is still in development. For now, the page shows a placeholder notice.`)
};

const es_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta pagina permitira a los gerentes crear y asignar turnos. La funcion de programacion aun esta en desarrollo. Por ahora, la pagina muestra un aviso de marcador.`)
};

/**
* | output |
* | --- |
* | "This page will let managers create and assign shifts. The scheduling feature is still in development. For now, the page shows a placeholder notice." |
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