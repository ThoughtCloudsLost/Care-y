/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Flow_BodyInputs */

const en_demo_entry_flow_body = /** @type {(inputs: Demo_Entry_Flow_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the data flow panel from the top bar and every interaction in the simulator draws its path through the screen, encryption, API, server, and database lanes, with each step showing direction, timing, and a payload preview. Where the page scripts something that the real app handles differently, a badge marks that step as scripted.`)
};

const es_demo_entry_flow_body = /** @type {(inputs: Demo_Entry_Flow_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el panel de flujo de datos desde la barra superior y cada interacción en el simulador dibuja su recorrido a través de las líneas de pantalla, cifrado, API, servidor y base de datos, con cada paso mostrando dirección, duración y una vista previa del contenido. Donde la página simula algo que la aplicación real maneja de otra forma, una insignia marca ese paso como simulado.`)
};

/**
* | output |
* | --- |
* | "Open the data flow panel from the top bar and every interaction in the simulator draws its path through the screen, encryption, API, server, and database lan..." |
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