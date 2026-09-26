/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Schedule_DescInputs */

const en_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The schedule page manages recurring shifts, coverage assignments, and a calendar that reads by day, week, or month. Shift times and coverage assignments are stored in plaintext, because a shift is operational scheduling and not case data. A database dump shows who works which hours. Automatic ticket assignment uses shift coverage to route a new case to someone whose hours overlap. [The trust boundary](#deep-dive/the-trust-boundary) covers what else the server holds in the clear.`)
};

const es_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La página de horario gestiona turnos recurrentes, asignaciones de cobertura y un calendario que se consulta por día, semana o mes. Los horarios de turnos y las asignaciones de cobertura se almacenan en texto plano, porque un turno es programación operativa y no datos de un caso. Un volcado de la base de datos muestra quién trabaja en qué horarios. La asignación automática de tickets usa la cobertura de turnos para dirigir un caso nuevo a alguien cuyas horas se solapen. [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que el servidor guarda en claro.`)
};

const en_xa2_demo_section_schedule_desc = /** @type {(inputs: Demo_Section_Schedule_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè schèdùlè pàgè mànàgès rècùrrìng shìfts, còvèràgè àssìgnmènts, ànd à càlèndàr thàt rèàds by dày, wèèk, òr mònth. Shìft tìmès ànd còvèràgè àssìgnmènts àrè stòrèd ìn plàìntèxt, bècàùsè à shìft ìs òpèràtìònàl schèdùlìng ànd nòt càsè dàtà. À dàtàbàsè dùmp shòws whò wòrks whìch hòùrs. Àùtòmàtìc tìckèt àssìgnmènt ùsès shìft còvèràgè tò ròùtè à nèw càsè tò sòmèònè whòsè hòùrs òvèrlàp. [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt èlsè thè sèrvèr hòlds ìn thè clèàr. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The schedule page manages recurring shifts, coverage assignments, and a calendar that reads by day, week, or month. Shift times and coverage assignments are ..." |
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