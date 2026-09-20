/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Merge_Undo_LockedInputs */

const en_error_merge_undo_locked = /** @type {(inputs: Error_Merge_Undo_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This merge undo is locked.`)
};

const es_error_merge_undo_locked = /** @type {(inputs: Error_Merge_Undo_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La reversión de esta fusión está bloqueada.`)
};

const en_xa2_error_merge_undo_locked = /** @type {(inputs: Error_Merge_Undo_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs mèrgè ùndò ìs lòckèd. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This merge undo is locked." |
*
* @param {Error_Merge_Undo_LockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_merge_undo_locked = /** @type {((inputs?: Error_Merge_Undo_LockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Merge_Undo_LockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_merge_undo_locked(inputs)
	if (locale === "en-XA") return en_xa2_error_merge_undo_locked(inputs)
	return en_error_merge_undo_locked(inputs)
});