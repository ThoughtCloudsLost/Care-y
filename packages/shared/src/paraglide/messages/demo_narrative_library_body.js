/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_BodyInputs */

const en_demo_narrative_library_body = /** @type {(inputs: Demo_Narrative_Library_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library stores articles that volunteers can reference during calls. Each article body is encrypted with the organization key before it reaches the database. The list, detail view (with file attachments and community votes), and rich-text editor all operate against real server endpoints running inside your browser.`)
};

const es_demo_narrative_library_body = /** @type {(inputs: Demo_Narrative_Library_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca almacena articulos que los voluntarios pueden consultar durante las llamadas. El cuerpo de cada articulo se cifra con la clave de la organizacion antes de llegar a la base de datos. La lista, la vista detallada (con adjuntos y votos de la comunidad), y el editor de texto enriquecido operan contra puntos finales reales del servidor que se ejecutan dentro de tu navegador.`)
};

/**
* | output |
* | --- |
* | "The library stores articles that volunteers can reference during calls. Each article body is encrypted with the organization key before it reaches the databa..." |
*
* @param {Demo_Narrative_Library_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_body = /** @type {((inputs?: Demo_Narrative_Library_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_body(inputs)
	return es_demo_narrative_library_body(inputs)
});