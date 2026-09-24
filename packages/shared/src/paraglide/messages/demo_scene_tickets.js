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

const en_xa2_demo_scene_tickets = /** @type {(inputs: Demo_Scene_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèts •••⟧`)
};

/**
* | output |
* | --- |
* | "Tickets" |
*
* @param {Demo_Scene_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_scene_tickets = /** @type {((inputs?: Demo_Scene_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Scene_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_scene_tickets(inputs)
	if (locale === "en-XA") return en_xa2_demo_scene_tickets(inputs)
	return en_demo_scene_tickets(inputs)
});