/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Client_Merge_Confirm_TitleInputs */

const en_client_merge_confirm_title = /** @type {(inputs: Client_Merge_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirm merge`)
};

const es_client_merge_confirm_title = /** @type {(inputs: Client_Merge_Confirm_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Confirmar fusion`)
};

/**
* | output |
* | --- |
* | "Confirm merge" |
*
* @param {Client_Merge_Confirm_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_merge_confirm_title = /** @type {((inputs?: Client_Merge_Confirm_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Client_Merge_Confirm_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_client_merge_confirm_title(inputs)
	return es_client_merge_confirm_title(inputs)
});