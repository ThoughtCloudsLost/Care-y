/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Kb_BodyInputs */

const en_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A preview of recently updated knowledge base articles on the dashboard. Tapping an article navigates to the full article in the library.
**Encryption.** Article titles are encrypted with the organization key before storage. The server stores ciphertext and the browser decrypts titles locally for display. A database breach would not reveal what articles the organization has written or what they contain.
**When the library is empty,** the section displays a notice instead of a list.`)
};

const es_demo_narrative_dashboard_kb_body = /** @type {(inputs: Demo_Narrative_Dashboard_Kb_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una vista previa de los artículos de la base de conocimiento actualizados recientemente en el panel principal. Tocar un artículo navega al artículo completo en la biblioteca.
**Cifrado.** Los títulos de los artículos están cifrados con la clave de la organización antes de almacenarse. El servidor almacena texto cifrado y el navegador descifra los títulos localmente para mostrarlos. Una brecha en la base de datos no revelaría qué artículos ha escrito la organización ni qué contienen.
**Cuando la biblioteca está vacía,** la sección muestra un aviso en lugar de una lista.`)
};

/**
* | output |
* | --- |
* | "A preview of recently updated knowledge base articles on the dashboard. Tapping an article navigates to the full article in the library. **Encryption.** Arti..." |
*
* @param {Demo_Narrative_Dashboard_Kb_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_kb_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Kb_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Kb_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_kb_body(inputs)
	return es_demo_narrative_dashboard_kb_body(inputs)
});