/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} View_Switcher_KanbanInputs */

const en_view_switcher_kanban = /** @type {(inputs: View_Switcher_KanbanInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kanban board`)
};

const es_view_switcher_kanban = /** @type {(inputs: View_Switcher_KanbanInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tablero kanban`)
};

/**
* | output |
* | --- |
* | "Kanban board" |
*
* @param {View_Switcher_KanbanInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_kanban = /** @type {((inputs?: View_Switcher_KanbanInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_KanbanInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_view_switcher_kanban(inputs)
	return es_view_switcher_kanban(inputs)
});