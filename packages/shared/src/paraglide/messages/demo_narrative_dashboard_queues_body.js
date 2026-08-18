/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Queues_BodyInputs */

const en_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets are organized into queues defined by the organization. The dashboard shows a card for each queue with live open and urgent counts.
**Navigation.** Tapping a queue card navigates to the ticket list filtered to that queue.
**Live counts.** Counts update automatically when tickets are created, closed, or reassigned anywhere in the app. The numbers are real queries against the database, not cached snapshots.
**Encryption.** Queue names and appearance settings are encrypted with the organization key. The server stores them as ciphertext and the browser decrypts them at display time. An attacker with database access would not know what the queues are called or how they are configured.`)
};

const es_demo_narrative_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los tickets se organizan en colas definidas por la organizacion. El panel principal muestra una tarjeta por cada cola con conteos de abiertos y urgentes en tiempo real.
**Navegacion.** Tocar una tarjeta de cola lleva a la lista de tickets filtrada por esa cola.
**Conteos en tiempo real.** Los conteos se actualizan automaticamente cuando se crean, cierran o reasignan tickets en cualquier parte de la aplicacion. Los numeros son consultas reales contra la base de datos, no capturas en cache.
**Cifrado.** Los nombres y la configuracion de apariencia de las colas estan cifrados con la clave de la organizacion. El servidor los almacena como texto cifrado y el navegador los descifra para mostrarlos. Un atacante con acceso a la base de datos no sabria como se llaman las colas ni como estan configuradas.`)
};

/**
* | output |
* | --- |
* | "Tickets are organized into queues defined by the organization. The dashboard shows a card for each queue with live open and urgent counts. **Navigation.** Ta..." |
*
* @param {Demo_Narrative_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_queues_body = /** @type {((inputs?: Demo_Narrative_Dashboard_Queues_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Queues_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_queues_body(inputs)
	return es_demo_narrative_dashboard_queues_body(inputs)
});