/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Entry_Flow_BodyInputs */

const en_demo_entry_flow_body = /** @type {(inputs: Demo_Entry_Flow_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The circuit icon in the top bar opens the data flow panel, and every interaction in the simulator draws its path through screen, encryption, API, server, and database lanes, with each step showing direction, timing, and a payload preview. Where the page scripts something the real app handles differently, a badge marks that step as scripted.`)
};

const es_demo_entry_flow_body = /** @type {(inputs: Demo_Entry_Flow_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El icono de circuito en la barra superior abre el panel de flujo de datos, y cada interacción en el simulador dibuja su recorrido a través de las líneas de pantalla, cifrado, API, servidor y base de datos, con cada paso mostrando dirección, duración y una vista previa del contenido. Donde la página simula algo que la aplicación real maneja de otra forma, una insignia marca ese paso como simulado.`)
};

/**
* | output |
* | --- |
* | "The circuit icon in the top bar opens the data flow panel, and every interaction in the simulator draws its path through screen, encryption, API, server, and..." |
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