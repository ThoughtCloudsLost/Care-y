/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Link_Replay_TourInputs */

const en_vol_link_replay_tour = /** @type {(inputs: Vol_Link_Replay_TourInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Replay App Tour`)
};

const es_vol_link_replay_tour = /** @type {(inputs: Vol_Link_Replay_TourInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Repetir Tour de la App`)
};

/**
* | output |
* | --- |
* | "Replay App Tour" |
*
* @param {Vol_Link_Replay_TourInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_link_replay_tour = /** @type {((inputs?: Vol_Link_Replay_TourInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Link_Replay_TourInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_link_replay_tour(inputs)
	return es_vol_link_replay_tour(inputs)
});