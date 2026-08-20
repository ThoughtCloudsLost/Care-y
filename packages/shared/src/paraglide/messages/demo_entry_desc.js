/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_DescInputs */

const en_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y is a call intake and case management system for mutual aid organizations serving at-risk populations. Both clients and volunteers face real danger if their identities or case details are exposed. The simulator on this page runs the real application against a database in your browser, and the text alongside it explains what each screen is doing.`)
};

const es_demo_entry_desc = /** @type {(inputs: Demo_Entry_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`CARE-Y es un sistema de gestión de llamadas y casos para organizaciones de ayuda mutua que atienden a poblaciones en riesgo. Tanto los clientes como las personas voluntarias corren peligro real si se exponen sus identidades o los detalles de sus casos. El simulador en esta página ejecuta la aplicación real sobre una base de datos en tu navegador, y el texto a su lado explica lo que hace cada pantalla.`)
};

/**
* | output |
* | --- |
* | "CARE-Y is a call intake and case management system for mutual aid organizations serving at-risk populations. Both clients and volunteers face real danger if ..." |
*
* @param {Demo_Entry_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_desc = /** @type {((inputs?: Demo_Entry_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_desc(inputs)
	return es_demo_entry_desc(inputs)
});