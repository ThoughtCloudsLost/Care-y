/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_UndoInputs */

const en_client_merge_undo = /** @type {(inputs: Client_Merge_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Undo merge`)
};

const es_client_merge_undo = /** @type {(inputs: Client_Merge_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deshacer fusión`)
};

const en_xa2_client_merge_undo = /** @type {(inputs: Client_Merge_UndoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùndò mèrgè •••⟧`)
};

/**
* | output |
* | --- |
* | "Undo merge" |
*
* @param {Client_Merge_UndoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_merge_undo = /** @type {((inputs?: Client_Merge_UndoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_UndoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_client_merge_undo(inputs)
	if (locale === "en-XA") return en_xa2_client_merge_undo(inputs)
	return en_client_merge_undo(inputs)
});