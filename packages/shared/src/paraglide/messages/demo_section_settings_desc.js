/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Settings_DescInputs */

const en_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The settings section covers what the user controls about their own account and device. Display names and language preferences are sealed to the organization key in the browser before storage. Usernames pass through the server only at creation or change and are stored as keyed hashes. A password change re-derives the account's encryption keys and re-wraps every case key the account holds. Appearance is kept on the device alone, with no copy on the server. Two-factor enrollment metadata and notification preferences are stored in plaintext. [How encryption works](#deep-dive/how-encryption-works) covers the organization key, and [How keys are derived](#deep-dive/how-keys-are-derived) covers what a password change re-derives.`)
};

const es_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de configuración trata lo que la persona usuaria controla de su propia cuenta y dispositivo. El nombre visible y la preferencia de idioma se sellan con la clave de la organización en el navegador antes de almacenarse. El nombre de usuario pasa por el servidor solo al crearse o cambiarse y se almacena como hash con clave. Un cambio de contraseña vuelve a derivar las claves de cifrado de la cuenta y reenvuelve cada clave de caso que la cuenta posee. La apariencia se conserva solo en el dispositivo, sin copia en el servidor. Los metadatos de registro de segundo factor y las preferencias de notificaciones se almacenan en texto plano. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización, y [Cómo se derivan las claves](#deep-dive/how-keys-are-derived) trata lo que vuelve a derivar un cambio de contraseña.`)
};

const en_xa2_demo_section_settings_desc = /** @type {(inputs: Demo_Section_Settings_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèttìngs sèctìòn còvèrs whàt thè ùsèr còntròls àbòùt thèìr òwn àccòùnt ànd dèvìcè. Dìsplày nàmès ànd làngùàgè prèfèrèncès àrè sèàlèd tò thè òrgànìzàtìòn kèy ìn thè bròwsèr bèfòrè stòràgè. Ùsèrnàmès pàss thròùgh thè sèrvèr ònly àt crèàtìòn òr chàngè ànd àrè stòrèd às kèyèd hàshès. À pàsswòrd chàngè rè-dèrìvès thè àccòùnt's èncryptìòn kèys ànd rè-wràps èvèry càsè kèy thè àccòùnt hòlds. Àppèàràncè ìs kèpt òn thè dèvìcè àlònè, wìth nò còpy òn thè sèrvèr. Twò-fàctòr ènròllmènt mètàdàtà ànd nòtìfìcàtìòn prèfèrèncès àrè stòrèd ìn plàìntèxt. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy, ànd [Hòw kèys àrè dèrìvèd](#dèèp-dìvè/hòw-kèys-àrè-dèrìvèd) còvèrs whàt à pàsswòrd chàngè rè-dèrìvès. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The settings section covers what the user controls about their own account and device. Display names and language preferences are sealed to the organization ..." |
*
* @param {Demo_Section_Settings_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_settings_desc = /** @type {((inputs?: Demo_Section_Settings_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Settings_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_settings_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_settings_desc(inputs)
	return en_demo_section_settings_desc(inputs)
});