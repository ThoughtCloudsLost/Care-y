/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Nav_BodyInputs */

const en_demo_entry_nav_body = /** @type {(inputs: Demo_Entry_Nav_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The contents menu in the top bar lists every handbook section, and clicking one jumps there. The simulator follows where the handbook goes, and tapping around inside the simulator moves the handbook to match. Nothing you type in the simulator leaves your device.`)
};

const es_demo_entry_nav_body = /** @type {(inputs: Demo_Entry_Nav_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El menú de contenidos en la barra superior lista todas las secciones del manual, y al pulsar una se salta directamente a ella. El simulador sigue a donde va el manual, y tocar dentro del simulador mueve el manual para coincidir, así que cualquiera de los dos puede guiar mientras nada de lo que escribas sale de tu dispositivo.`)
};

/**
* | output |
* | --- |
* | "The contents menu in the top bar lists every handbook section, and clicking one jumps there. The simulator follows where the handbook goes, and tapping aroun..." |
*
* @param {Demo_Entry_Nav_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_nav_body = /** @type {((inputs?: Demo_Entry_Nav_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Nav_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_nav_body(inputs)
	return en_demo_entry_nav_body(inputs)
});