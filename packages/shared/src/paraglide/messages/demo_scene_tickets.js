/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Scene_TicketsInputs */

const en_demo_scene_tickets = /** @type {(inputs: Demo_Scene_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets`)
};

const es_demo_scene_tickets = /** @type {(inputs: Demo_Scene_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets`)
};

/**
* | output |
* | --- |
* | "Tickets" |
*
* @param {Demo_Scene_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_scene_tickets = /** @type {((inputs?: Demo_Scene_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Scene_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_scene_tickets(inputs)
	return es_demo_scene_tickets(inputs)
});