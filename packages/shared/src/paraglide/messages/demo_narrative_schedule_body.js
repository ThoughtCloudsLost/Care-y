/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Schedule_BodyInputs */

const en_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The planned scope for shift scheduling is shifts that repeat on a schedule, assigning people to cover them, and a calendar showing where coverage is complete and where it is thin. The shift summary on the overview page is filled from placeholder values that are fixed rather than drawn from any schedule, so its times and initials are identical for every user and describe nobody's real shift.`)
};

const es_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El alcance previsto para la programación de turnos son turnos que se repiten según un horario, asignar personas para cubrirlos, y un calendario que muestre dónde la cobertura es completa y dónde es escasa. El resumen de turnos en la página de resumen general se llena con valores de marcador de posición que son fijos en lugar de provenir de un horario real, de modo que sus horas e iniciales son idénticas para cada cuenta y no describen el turno real de nadie.`)
};

const en_xa2_demo_narrative_schedule_body = /** @type {(inputs: Demo_Narrative_Schedule_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè plànnèd scòpè fòr shìft schèdùlìng ìs shìfts thàt rèpèàt òn à schèdùlè, àssìgnìng pèòplè tò còvèr thèm, ànd à càlèndàr shòwìng whèrè còvèràgè ìs còmplètè ànd whèrè ìt ìs thìn. Thè shìft sùmmàry òn thè òvèrvìèw pàgè ìs fìllèd fròm plàcèhòldèr vàlùès thàt àrè fìxèd ràthèr thàn dràwn fròm àny schèdùlè, sò ìts tìmès ànd ìnìtìàls àrè ìdèntìcàl fòr èvèry ùsèr ànd dèscrìbè nòbòdy's rèàl shìft. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The planned scope for shift scheduling is shifts that repeat on a schedule, assigning people to cover them, and a calendar showing where coverage is complete..." |
*
* @param {Demo_Narrative_Schedule_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_schedule_body = /** @type {((inputs?: Demo_Narrative_Schedule_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Schedule_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_schedule_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_schedule_body(inputs)
	return en_demo_narrative_schedule_body(inputs)
});