/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Controls_BodyInputs */

const en_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag the simulator by the grip above it and resize it from any edge. The toolbar switches between phone and desktop layouts. The simulator and the story scroll together by default. The link button in the toolbar breaks that connection so you can explore one without moving the other.`)
};

const es_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Arrastra el simulador desde el asa superior y cambia su tamano desde cualquier borde. La barra de herramientas alterna entre disposiciones de telefono y escritorio. El simulador y el texto se desplazan juntos por defecto. El boton de enlace en la barra de herramientas rompe esa conexion para que puedas explorar uno sin mover el otro.`)
};

/**
* | output |
* | --- |
* | "Drag the simulator by the grip above it and resize it from any edge. The toolbar switches between phone and desktop layouts. The simulator and the story scro..." |
*
* @param {Demo_Entry_Controls_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_controls_body = /** @type {((inputs?: Demo_Entry_Controls_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Controls_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_controls_body(inputs)
	return es_demo_entry_controls_body(inputs)
});