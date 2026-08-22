/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Controls_BodyInputs */

const en_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The floating toolbar above the simulator is also a drag handle, so you can grab it anywhere to reposition the frame. Phone and desktop preset buttons switch between layouts, and you can resize the frame from any edge. The link button keeps the handbook and simulator in sync by default, so interacting with one causes the other to follow along, but you can break that connection to explore one without moving the other.`)
};

const es_demo_entry_controls_body = /** @type {(inputs: Demo_Entry_Controls_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La barra de herramientas flotante sobre el simulador también sirve como asa de arrastre, así que puedes agarrarla en cualquier punto para reposicionar el marco. Los botones de preajuste de teléfono y escritorio en el centro alternan entre disposiciones, y puedes cambiar el tamaño del marco desde cualquier borde. El botón de enlace mantiene el manual y el simulador sincronizados por defecto, así que interactuar con uno hace que el otro lo siga, pero puedes romper esa conexión para explorar uno sin mover el otro.`)
};

/**
* | output |
* | --- |
* | "The floating toolbar above the simulator is also a drag handle, so you can grab it anywhere to reposition the frame. Phone and desktop preset buttons switch ..." |
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