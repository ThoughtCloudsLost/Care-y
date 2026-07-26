/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_UndoInputs */

const en_client_merge_undo = /** @type {(inputs: Client_Merge_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Undo merge`)
};

const es_client_merge_undo = /** @type {(inputs: Client_Merge_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deshacer fusion`)
};

/**
* | output |
* | --- |
* | "Undo merge" |
*
* @param {Client_Merge_UndoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_undo = /** @type {((inputs?: Client_Merge_UndoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_UndoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_undo(inputs)
	return es_client_merge_undo(inputs)
});