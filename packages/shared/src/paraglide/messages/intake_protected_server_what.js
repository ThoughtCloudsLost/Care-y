/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Server_WhatInputs */

const en_intake_protected_server_what = /** @type {(inputs: Intake_Protected_Server_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server stores your information as scrambled data it cannot decode.`)
};

const es_intake_protected_server_what = /** @type {(inputs: Intake_Protected_Server_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor almacena tu informacion como datos codificados que no puede descifrar.`)
};

/**
* | output |
* | --- |
* | "The server stores your information as scrambled data it cannot decode." |
*
* @param {Intake_Protected_Server_WhatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_server_what = /** @type {((inputs?: Intake_Protected_Server_WhatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Server_WhatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_server_what(inputs)
	return es_intake_protected_server_what(inputs)
});