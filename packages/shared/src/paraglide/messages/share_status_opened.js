/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Status_OpenedInputs */

const en_share_status_opened = /** @type {(inputs: Share_Status_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opened`)
};

const es_share_status_opened = /** @type {(inputs: Share_Status_OpenedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abierto`)
};

/**
* | output |
* | --- |
* | "Opened" |
*
* @param {Share_Status_OpenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_status_opened = /** @type {((inputs?: Share_Status_OpenedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Status_OpenedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_status_opened(inputs)
	return es_share_status_opened(inputs)
});