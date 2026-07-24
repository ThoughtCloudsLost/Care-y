/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Kanban_Coming_Soon_BodyInputs */

const en_kanban_coming_soon_body = /** @type {(inputs: Kanban_Coming_Soon_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Drag-and-drop ticket management is on the way.`)
};

const es_kanban_coming_soon_body = /** @type {(inputs: Kanban_Coming_Soon_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La gestión de tickets con arrastrar y soltar está en camino.`)
};

/**
* | output |
* | --- |
* | "Drag-and-drop ticket management is on the way." |
*
* @param {Kanban_Coming_Soon_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const kanban_coming_soon_body = /** @type {((inputs?: Kanban_Coming_Soon_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Kanban_Coming_Soon_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_kanban_coming_soon_body(inputs)
	return es_kanban_coming_soon_body(inputs)
});