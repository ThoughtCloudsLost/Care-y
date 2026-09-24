/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Chip_Resume_FollowInputs */

const en_demo_chip_resume_follow = /** @type {(inputs: Demo_Chip_Resume_FollowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resume following`)
};

const es_demo_chip_resume_follow = /** @type {(inputs: Demo_Chip_Resume_FollowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reanudar seguimiento`)
};

const en_xa2_demo_chip_resume_follow = /** @type {(inputs: Demo_Chip_Resume_FollowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsùmè fòllòwìng •••••⟧`)
};

/**
* | output |
* | --- |
* | "Resume following" |
*
* @param {Demo_Chip_Resume_FollowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_chip_resume_follow = /** @type {((inputs?: Demo_Chip_Resume_FollowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Chip_Resume_FollowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_chip_resume_follow(inputs)
	if (locale === "en-XA") return en_xa2_demo_chip_resume_follow(inputs)
	return en_demo_chip_resume_follow(inputs)
});