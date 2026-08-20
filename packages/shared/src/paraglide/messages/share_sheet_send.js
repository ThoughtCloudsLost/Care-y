/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Sheet_SendInputs */

const en_share_sheet_send = /** @type {(inputs: Share_Sheet_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send by SMS`)
};

const es_share_sheet_send = /** @type {(inputs: Share_Sheet_SendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enviar por SMS`)
};

/**
* | output |
* | --- |
* | "Send by SMS" |
*
* @param {Share_Sheet_SendInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_sheet_send = /** @type {((inputs?: Share_Sheet_SendInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Sheet_SendInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_sheet_send(inputs)
	return es_share_sheet_send(inputs)
});