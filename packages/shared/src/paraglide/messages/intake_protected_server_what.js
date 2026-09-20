/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Server_WhatInputs */

const en_intake_protected_server_what = /** @type {(inputs: Intake_Protected_Server_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The server stores your information as scrambled data it cannot decode.`)
};

const es_intake_protected_server_what = /** @type {(inputs: Intake_Protected_Server_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El servidor almacena tu información como datos codificados que no puede descifrar.`)
};

const en_xa2_intake_protected_server_what = /** @type {(inputs: Intake_Protected_Server_WhatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèrvèr stòrès yòùr ìnfòrmàtìòn às scràmblèd dàtà ìt cànnòt dècòdè. •••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The server stores your information as scrambled data it cannot decode." |
*
* @param {Intake_Protected_Server_WhatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_server_what = /** @type {((inputs?: Intake_Protected_Server_WhatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Server_WhatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_protected_server_what(inputs)
	if (locale === "en-XA") return en_xa2_intake_protected_server_what(inputs)
	return en_intake_protected_server_what(inputs)
});