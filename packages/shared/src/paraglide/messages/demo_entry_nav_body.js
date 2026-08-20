/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Nav_BodyInputs */

const en_demo_entry_nav_body = /** @type {(inputs: Demo_Entry_Nav_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The section tabs at the top of the page jump to a feature, and the simulator opens that screen. Tapping around inside the simulator works in the other direction, the handbook follows where you go, and nothing you type here leaves your device.`)
};

const es_demo_entry_nav_body = /** @type {(inputs: Demo_Entry_Nav_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las pestañas de sección en la parte superior de la página saltan a una función, y el simulador abre esa pantalla. Tocar dentro del simulador funciona en la otra dirección, el manual sigue a donde vayas, y nada de lo que escribas aquí sale de tu dispositivo.`)
};

/**
* | output |
* | --- |
* | "The section tabs at the top of the page jump to a feature, and the simulator opens that screen. Tapping around inside the simulator works in the other direct..." |
*
* @param {Demo_Entry_Nav_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_nav_body = /** @type {((inputs?: Demo_Entry_Nav_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Nav_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_nav_body(inputs)
	return es_demo_entry_nav_body(inputs)
});