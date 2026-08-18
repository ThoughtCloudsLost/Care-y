/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Nav_BodyInputs */

const en_demo_entry_nav_body = /** @type {(inputs: Demo_Entry_Nav_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pick a feature from the list and the simulator opens that screen. Tap around in the simulator and the story follows you. Nothing you type here leaves your device.`)
};

const es_demo_entry_nav_body = /** @type {(inputs: Demo_Entry_Nav_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elige una funcion de la lista y el simulador abre esa pantalla. Toca por el simulador y el texto te sigue. Nada de lo que escribas aqui sale de tu dispositivo.`)
};

/**
* | output |
* | --- |
* | "Pick a feature from the list and the simulator opens that screen. Tap around in the simulator and the story follows you. Nothing you type here leaves your de..." |
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