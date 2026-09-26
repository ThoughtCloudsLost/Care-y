/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Section_Admin_Comms_DescInputs */

const en_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The communications section covers the channels an organization uses to reach clients and the rules that govern them. Provider credentials are encrypted with the server's operational key, because the server presents them to the provider on every call and message. Greetings and SMS templates are stored in plaintext, because the telephony provider speaks a greeting and sends a template to someone who has not signed in. Blocked numbers are unreadable in a stolen database but not protected from the running server. The channel policy decides which channels a ticket can use. [How encryption works](#deep-dive/how-encryption-works) covers the organization key, and [The trust boundary](#deep-dive/the-trust-boundary) covers what the server's operational key protects.`)
};

const es_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de comunicaciones trata los canales que una organización usa para contactar a los clientes y las reglas que los gobiernan. Las credenciales del proveedor se cifran con la clave operativa del servidor, porque el servidor las presenta al proveedor en cada llamada y mensaje. Los saludos y las plantillas SMS se almacenan en texto plano, porque el proveedor de telefonía reproduce un saludo y envía una plantilla a alguien que no ha iniciado sesión. Los números bloqueados son ilegibles en una base de datos robada, pero no están protegidos del servidor en ejecución. La política de canales decide qué canales puede usar un ticket. [Cómo funciona el cifrado](#deep-dive/how-encryption-works) trata la clave de la organización, y [La frontera de confianza](#deep-dive/the-trust-boundary) trata lo que protege la clave operativa del servidor.`)
};

const en_xa2_demo_section_admin_comms_desc = /** @type {(inputs: Demo_Section_Admin_Comms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè còmmùnìcàtìòns sèctìòn còvèrs thè chànnèls àn òrgànìzàtìòn ùsès tò rèàch clìènts ànd thè rùlès thàt gòvèrn thèm. Pròvìdèr crèdèntìàls àrè èncryptèd wìth thè sèrvèr's òpèràtìònàl kèy, bècàùsè thè sèrvèr prèsènts thèm tò thè pròvìdèr òn èvèry càll ànd mèssàgè. Grèètìngs ànd SMS tèmplàtès àrè stòrèd ìn plàìntèxt, bècàùsè thè tèlèphòny pròvìdèr spèàks à grèètìng ànd sènds à tèmplàtè tò sòmèònè whò hàs nòt sìgnèd ìn. Blòckèd nùmbèrs àrè ùnrèàdàblè ìn à stòlèn dàtàbàsè bùt nòt pròtèctèd fròm thè rùnnìng sèrvèr. Thè chànnèl pòlìcy dècìdès whìch chànnèls à tìckèt càn ùsè. [Hòw èncryptìòn wòrks](#dèèp-dìvè/hòw-èncryptìòn-wòrks) còvèrs thè òrgànìzàtìòn kèy, ànd [Thè trùst bòùndàry](#dèèp-dìvè/thè-trùst-bòùndàry) còvèrs whàt thè sèrvèr's òpèràtìònàl kèy pròtècts. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The communications section covers the channels an organization uses to reach clients and the rules that govern them. Provider credentials are encrypted with ..." |
*
* @param {Demo_Section_Admin_Comms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_comms_desc = /** @type {((inputs?: Demo_Section_Admin_Comms_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Section_Admin_Comms_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_section_admin_comms_desc(inputs)
	if (locale === "en-XA") return en_xa2_demo_section_admin_comms_desc(inputs)
	return en_demo_section_admin_comms_desc(inputs)
});