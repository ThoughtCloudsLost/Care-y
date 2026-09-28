/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Schedule_DescInputs */

const en_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The schedule page manages recurring shifts, coverage assignments, and a calendar that reads by day, week, or month. Shift data is encrypted at rest. Automatic ticket assignment uses shift coverage to route a new case to someone whose hours overlap. [The trust boundary](#deep-dive/the-trust-boundary) covers what the server holds.`)
};

const es_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de horario gestiona turnos recurrentes, asignaciones de cobertura y un calendario que se consulta por día, semana o mes. Los datos de turnos se cifran en reposo. La asignación automática de tickets usa la cobertura de turnos para dirigir un caso nuevo a alguien cuyas horas se solapen. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que almacena el servidor.`)
};

const en_xa2_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè schèdùlè pàgè mànàgès rècùrrìng shìfts, còvèràgè àssìgnmènts, ànd à càlèndàr thàt rèàds by dày, wèèk, òr mònth. Shìft dàtà ìs èncryptèd àt rèst. Àùtòmàtìc tìckèt àssìgnmènt ùsès shìft còvèràgè tò ròùtè à nèw càsè tò sòmèònè whòsè hòùrs òvèrlàp. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt thè sèrvèr hòlds. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The schedule page manages recurring shifts, coverage assignments, and a calendar that reads by day, week, or month. Shift data is encrypted at rest. Automati..." |
*
* @param {Demo_Section_Schedule_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_schedule_desc = /** @type {((inputs?: Demo_Section_Schedule_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Schedule_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_schedule_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_schedule_desc(inputs)
	return en_demo_section_schedule_desc(inputs)
});