/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Modes_BodyInputs */

const en_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Read and Simulate are toggled from the top bar. Read mode shows the handbook as a document with the simulator hidden but still running, and you can long press any screenshot to peek at the live app. Simulate mode shows the phone frame alongside the text on wide screens, and on narrow screens or when the frame fills the window it activates fullscreen, where the simulator fills the screen and the handbook moves into a resizable drawer with a book icon tab on the edge to open and reposition it.`)
};

const es_demo_entry_modes_body = /** @type {(inputs: Demo_Entry_Modes_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lectura y Simulación se alternan desde la barra superior. El modo lectura muestra el manual como un documento con el simulador oculto pero activo, y se puede mantener pulsada cualquier captura de pantalla para ver la aplicación en vivo. El modo simulación muestra el marco del teléfono junto al texto en pantallas anchas, y en pantallas estrechas o cuando el marco ocupa toda la ventana se activa la pantalla completa, donde el simulador llena la pantalla y el manual pasa a un cajón redimensionable con un icono de libro en el borde para abrirlo y reposicionarlo.`)
};

/**
* | output |
* | --- |
* | "Read and Simulate are toggled from the top bar. Read mode shows the handbook as a document with the simulator hidden but still running, and you can long pres..." |
*
* @param {Demo_Entry_Modes_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_modes_body = /** @type {((inputs?: Demo_Entry_Modes_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Modes_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_entry_modes_body(inputs)
	return en_demo_entry_modes_body(inputs)
});