/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Flow_BodyInputs */

const en_demo_entry_flow_body = /** @type {(inputs: Demo_Entry_Flow_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the data flow panel from the top bar. Every interaction in the simulator shows its path through the screen, encryption, API, server, and database lanes. Each step shows direction, timing, and a payload preview. Where the page scripts something that the real app handles differently, a badge marks the seam.`)
};

const es_demo_entry_flow_body = /** @type {(inputs: Demo_Entry_Flow_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el panel de flujo de datos desde la barra superior. Cada interaccion en el simulador muestra su recorrido a traves de las lineas de pantalla, cifrado, API, servidor y base de datos. Cada paso muestra direccion, duracion y una vista previa del contenido. Donde la pagina simula algo que la aplicacion real maneja de otra forma, una insignia marca la diferencia.`)
};

/**
* | output |
* | --- |
* | "Open the data flow panel from the top bar. Every interaction in the simulator shows its path through the screen, encryption, API, server, and database lanes...." |
*
* @param {Demo_Entry_Flow_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_entry_flow_body = /** @type {((inputs?: Demo_Entry_Flow_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Entry_Flow_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_entry_flow_body(inputs)
	return es_demo_entry_flow_body(inputs)
});