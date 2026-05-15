/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Replay_WalkthroughInputs */

const en_settings_replay_walkthrough = /** @type {(inputs: Settings_Replay_WalkthroughInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Review security walkthrough`)
};

const es_settings_replay_walkthrough = /** @type {(inputs: Settings_Replay_WalkthroughInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Revisar guía de seguridad`)
};

/**
* | output |
* | --- |
* | "Review security walkthrough" |
*
* @param {Settings_Replay_WalkthroughInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_replay_walkthrough = /** @type {((inputs?: Settings_Replay_WalkthroughInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Replay_WalkthroughInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_replay_walkthrough(inputs)
	return es_settings_replay_walkthrough(inputs)
});