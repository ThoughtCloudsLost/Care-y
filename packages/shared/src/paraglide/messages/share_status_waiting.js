/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Status_WaitingInputs */

const en_share_status_waiting = /** @type {(inputs: Share_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Waiting`)
};

const es_share_status_waiting = /** @type {(inputs: Share_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Pendiente`)
};

/**
* | output |
* | --- |
* | "Waiting" |
*
* @param {Share_Status_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_status_waiting = /** @type {((inputs?: Share_Status_WaitingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Status_WaitingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_status_waiting(inputs)
	return es_share_status_waiting(inputs)
});