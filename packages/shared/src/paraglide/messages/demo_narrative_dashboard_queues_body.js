/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Queues_BodyInputs */

const en_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`One card per queue defined by the organization, showing live counts of open and urgent tickets.
**Live counts.** Counts are real-time database queries, not cached snapshots. They update automatically when tickets are created, closed, or reassigned anywhere in the system.
**Encryption.** Queue names and appearance settings are encrypted with the organization key. The server stores only ciphertext. The browser decrypts them at display time.`)
};

const es_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una tarjeta por cola definida por la organización, con conteos en tiempo real de tickets abiertos y urgentes.
**Conteos en tiempo real.** Los conteos son consultas directas a la base de datos, no capturas en caché. Se actualizan automáticamente cuando se crean, cierran o reasignan tickets en cualquier parte del sistema.
**Cifrado.** Los nombres y la configuración de apariencia de las colas están cifrados con la clave de la organización. El servidor almacena solo texto cifrado. El navegador los descifra para mostrarlos.`)
};

/**
* | output |
* | --- |
* | "One card per queue defined by the organization, showing live counts of open and urgent tickets. **Live counts.** Counts are real-time database queries, not c..." |
*
* @param {Demo_Narrative_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_queues_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Queues_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Queues_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_queues_body(inputs)
	return en_demo_narrative_dashboard_queues_body(inputs)
});