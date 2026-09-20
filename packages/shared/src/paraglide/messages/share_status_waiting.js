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

const en_xa2_share_status_waiting = /** @type {(inputs: Share_Status_WaitingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Wàìtìng •••⟧`)
};

/**
* | output |
* | --- |
* | "Waiting" |
*
* @param {Share_Status_WaitingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_status_waiting = /** @type {((inputs?: Share_Status_WaitingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Status_WaitingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_status_waiting(inputs)
	if (locale === "en-XA") return en_xa2_share_status_waiting(inputs)
	return en_share_status_waiting(inputs)
});