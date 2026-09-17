/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Controls_BodyInputs */

const en_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In simulate mode, a toolbar above the frame lets you resize with phone or desktop presets, switch roles, and enter fullscreen. The toolbar is also a drag handle, so you can grab it anywhere to reposition the frame, and you can resize from any edge or corner by dragging.`)
};

const es_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`En el modo simulación, una barra oscura sobre el marco permite cambiar el tamaño con preajustes de teléfono o escritorio, cambiar de rol y entrar en pantalla completa. La barra también sirve como asa de arrastre, así que puedes agarrarla en cualquier punto para reposicionar el marco, y puedes cambiar el tamaño desde cualquier borde o esquina arrastrando.`)
};

/**
* | output |
* | --- |
* | "In simulate mode, a toolbar above the frame lets you resize with phone or desktop presets, switch roles, and enter fullscreen. The toolbar is also a drag han..." |
*
* @param {Demo_Entry_Controls_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_controls_body = /** @type {((inputs?: Demo_Entry_Controls_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Controls_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_controls_body(inputs)
	return en_demo_entry_controls_body(inputs)
});